import dataclasses, inspect, typing, unittest, json
M = None

class Resource:
    def __init__(self, *, opening=None, closing=None):
        self.events=[]; self.opening=opening; self.closing=closing
    def open(self):
        self.events.append('open')
        if self.opening is not None: raise self.opening
    def close(self):
        self.events.append('close')
        if self.closing is not None: raise self.closing

class Lifecycle(unittest.TestCase):
    def test_success_owns_exactly_one_resource(self):
        r=Resource();calls=[]
        def factory():calls.append(1);return r
        with M.managed_session(factory) as opened:
            self.assertIs(opened,r);self.assertEqual(r.events,['open']);r.events.append('use')
        self.assertEqual(calls,[1]);self.assertEqual(r.events,['open','use','close'])
    def test_body_failure_preserves_identity(self):
        r=Resource();error=ValueError('body')
        with self.assertRaises(ValueError) as raised:
            with M.managed_session(lambda:r):raise error
        self.assertIs(raised.exception,error);self.assertEqual(r.events,['open','close'])
    def test_acquisition_failure_before_object_exists(self):
        error=OSError('factory');calls=[]
        def factory():calls.append('factory');raise error
        with self.assertRaises(OSError) as raised:
            with M.managed_session(factory):self.fail('body must not run')
        self.assertIs(raised.exception,error);self.assertEqual(calls,['factory'])
    def test_partial_open_failure_still_closes(self):
        error=OSError('opening');r=Resource(opening=error)
        with self.assertRaises(OSError) as raised:
            with M.managed_session(lambda:r):self.fail('body must not run')
        self.assertIs(raised.exception,error);self.assertEqual(r.events,['open','close'])
    def test_close_failure_is_visible(self):
        error=OSError('close');r=Resource(closing=error)
        with self.assertRaises(OSError) as raised:
            with M.managed_session(lambda:r):pass
        self.assertIs(raised.exception,error);self.assertEqual(r.events,['open','close'])
    def test_body_and_close_failures_both_survive(self):
        body=ValueError('body');close=OSError('close');r=Resource(closing=close)
        with self.assertRaises(BaseExceptionGroup) as raised:
            with M.managed_session(lambda:r):raise body
        self.assertEqual(raised.exception.exceptions,(body,close));self.assertEqual(r.events,['open','close'])
    def test_open_and_close_failures_both_survive(self):
        opening=OSError('open');close=OSError('close');r=Resource(opening=opening,closing=close)
        with self.assertRaises(BaseExceptionGroup) as raised:
            with M.managed_session(lambda:r):pass
        self.assertEqual(raised.exception.exceptions,(opening,close));self.assertEqual(r.events,['open','close'])
    def test_non_exception_control_signal_is_not_swallowed(self):
        signal=KeyboardInterrupt('cancel');r=Resource()
        with self.assertRaises(KeyboardInterrupt) as raised:
            with M.managed_session(lambda:r):raise signal
        self.assertIs(raised.exception,signal);self.assertEqual(r.events,['open','close'])

    def test_control_signal_and_cleanup_failure_are_both_preserved(self):
        signal=KeyboardInterrupt('stop');cleanup=OSError('close');r=Resource(closing=cleanup)
        caught=None
        try:
            with M.managed_session(lambda:r):raise signal
        except BaseException as error:
            caught=error
        self.assertIsInstance(caught,BaseExceptionGroup)
        self.assertEqual(caught.exceptions,(signal,cleanup));self.assertEqual(r.events,['open','close'])


    def test_cleanup_control_signal_preserves_primary(self):
        primary=ValueError('body');cleanup=KeyboardInterrupt('cleanup cancelled')
        resource=Resource(closing=cleanup)
        caught=None
        try:
            with M.managed_session(lambda:resource):raise primary
        except BaseException as error:caught=error
        self.assertIsInstance(caught,BaseExceptionGroup)
        self.assertEqual(caught.exceptions,(primary,cleanup))
        self.assertEqual(resource.events,['open','close'])
        primary=OSError('partial open');cleanup=GeneratorExit('cleanup exit')
        resource=Resource(opening=primary,closing=cleanup)
        caught=None
        try:
            with M.managed_session(lambda:resource):self.fail('body must not execute')
        except BaseException as error:caught=error
        self.assertIsInstance(caught,BaseExceptionGroup)
        self.assertEqual(caught.exceptions,(primary,cleanup))
        self.assertEqual(resource.events,['open','close'])

    def test_falsey_resource_is_still_owned(self):
        class Falsey(Resource):
            def __bool__(self):return False
        resource=Falsey()
        with M.managed_session(lambda:resource) as opened:self.assertIs(opened,resource)
        self.assertEqual(resource.events,['open','close'])

class Decorators(unittest.TestCase):
    def test_metadata_and_introspection_signature(self):
        def sample(value:int, /, adjustment=2, *, tenant:str='p')->int:
            """A quote in cents."""
            return value+adjustment
        wrapped=M.memoize_by_key(lambda *a,**k:repr((a,k)))(sample)
        self.assertEqual(wrapped.__name__,sample.__name__);self.assertEqual(wrapped.__doc__,sample.__doc__)
        self.assertEqual(inspect.signature(wrapped),inspect.signature(sample));self.assertEqual(wrapped.__annotations__,sample.__annotations__)
    def test_parameters_and_custom_context_key(self):
        calls=[]
        def quote(value, /, *, tenant):calls.append((value,tenant));return value+len(tenant)
        cached=M.memoize_by_key(lambda value, /, *, tenant:(tenant,value))(quote)
        self.assertEqual(cached(3,tenant='p'),4);self.assertEqual(cached(3,tenant='long'),7)
        self.assertEqual(cached(3,tenant='p'),4);self.assertEqual(calls,[(3,'p'),(3,'long')])
    def test_custom_key_can_merge_equivalent_inputs(self):
        calls=[]
        def lookup(text):calls.append(text);return text.strip().lower()
        cached=M.memoize_by_key(lambda text:text.strip().lower())(lookup)
        self.assertEqual(cached(' PIPI '),'pipi');self.assertEqual(cached('pipi'),'pipi');self.assertEqual(calls,[' PIPI '])
    def test_hash_collisions_keep_distinct_business_keys(self):
        class Key:
            def __init__(self,value):self.value=value
            def __hash__(self):return 17
            def __eq__(self,other):return isinstance(other,Key) and self.value==other.value
        for key_fn in (lambda value:value,Key):
            with self.subTest(key_fn=key_fn):
                calls=[]
                def quote(value):calls.append(value);return value*10
                cached=M.memoize_by_key(key_fn)(quote)
                self.assertEqual([cached(value) for value in (-1,-2,-1,-2)],[-10,-20,-10,-20])
                self.assertEqual(calls,[-1,-2])
                cached.cache_clear()
                self.assertEqual(cached(-2),-20);self.assertEqual(calls,[-1,-2,-2])
    def test_falsey_results_are_cached(self):
        for value in (None,0,False,''):
            calls=[]
            def function(x):calls.append(x);return value
            cached=M.memoize_by_key(lambda x:x)(function)
            self.assertIs(cached(1),value);self.assertIs(cached(1),value);self.assertEqual(calls,[1])
    def test_exception_identity_and_retry(self):
        error=OSError('temporary');calls=[]
        def unstable(x):
            calls.append(x)
            if len(calls)==1:raise error
            return 9
        cached=M.memoize_by_key(lambda x:x)(unstable)
        with self.assertRaises(OSError) as raised:cached(1)
        self.assertIs(raised.exception,error);self.assertEqual(cached(1),9);self.assertEqual(cached(1),9);self.assertEqual(calls,[1,1])
    def test_clear_and_function_isolation(self):
        decorate=M.memoize_by_key(lambda x:x);a_calls=[];b_calls=[]
        def a(x):a_calls.append(x);return x+1
        def b(x):b_calls.append(x);return x+100
        first,second=decorate(a),decorate(b)
        self.assertEqual(first(2),3);self.assertEqual(second(2),102)
        first.cache_clear();self.assertEqual(first(2),3);self.assertEqual(second(2),102)
        self.assertEqual(a_calls,[2,2]);self.assertEqual(b_calls,[2])
    def test_cache_hit_does_not_bypass_original_signature(self):
        key_calls=[];business_calls=[]
        def key(*args,**kwargs):key_calls.append((args,kwargs));return 'same'
        def original(value, /, *, scale=1):business_calls.append(value);return value*scale
        cached=M.memoize_by_key(key)(original)
        self.assertEqual(cached(2),2)
        for args,kwargs in [((),{'value':9}),((2,3),{}),((),{}),((2,),{'unknown':1})]:
            with self.subTest(args=args,kwargs=kwargs),self.assertRaises(TypeError):cached(*args,**kwargs)
        self.assertEqual(len(key_calls),1);self.assertEqual(business_calls,[2])
    def test_key_failure_does_not_run_business(self):
        calls=[];error=ValueError('key')
        def key(x):raise error
        def business(x):calls.append(x);return x
        decorated=M.memoize_by_key(key)(business)
        with self.assertRaises(ValueError) as raised:decorated(1)
        self.assertIs(raised.exception,error);self.assertEqual(calls,[])

    def test_original_custom_attributes_cannot_replace_cache_internals(self):
        def original(value):return value+1
        original.function=lambda value:999
        original.cache={2:999}
        original.cache_clear=None
        cached=M.memoize_by_key(lambda value:value)(original)
        self.assertEqual(cached(2),3)
        cached.cache_clear()
        self.assertEqual(cached(2),3)


    def test_wrapped_identity_and_variadic_forwarding(self):
        calls=[];keys=[]
        def original(first,/,*values,scale=2,**options):
            calls.append((first,values,scale,options));return (first+sum(values))*scale+options.get('bonus',0)
        def key(*args,**kwargs):
            keys.append((args,kwargs));return (args,tuple(sorted(kwargs.items())))
        wrapped=M.memoize_by_key(key)(original)
        self.assertIs(wrapped.__wrapped__,original)
        self.assertEqual(wrapped(2,3,4,scale=3,bonus=5),32)
        self.assertEqual(wrapped(2,3,4,scale=3,bonus=5),32)
        self.assertEqual(calls,[(2,(3,4),3,{'bonus':5})])
        self.assertEqual(keys,[((2,3,4),{'scale':3,'bonus':5})]*2)

class Protocols(unittest.TestCase):
    def test_declares_structural_protocol_without_claiming_static_analysis(self):
        self.assertTrue(inspect.isclass(M.QuoteProvider))
        self.assertIn(typing.Protocol,M.QuoteProvider.__mro__)
        self.assertIs(typing.get_type_hints(M.QuoteProvider.quote).get('return'),int)

    def test_canonical_data_value_equality_and_hash(self):
        a=M.Shipment(' ship-A ',[2,3]);b=M.Shipment('ship-A',(2,3))
        self.assertTrue(dataclasses.is_dataclass(a));self.assertEqual(a,b);self.assertEqual(hash(a),hash(b));self.assertEqual(a.identifier,'ship-A')
    def test_frozen_and_independent_snapshot(self):
        values=[2,3];a=M.Shipment('a',values);values.append(8)
        self.assertEqual(a.weights,(2,3))
        self.assertTrue(type(a).__dataclass_params__.frozen)
        for name,value in [('identifier','b'),('weights',(99,))]:
            with self.subTest(field=name):
                with self.assertRaises(dataclasses.FrozenInstanceError):setattr(a,name,value)
                self.assertEqual(a.identifier,'a');self.assertEqual(a.weights,(2,3))
    def test_invalid_constructor_values(self):
        for value in ('', '  '):
            with self.subTest(value=value),self.assertRaises(ValueError):M.Shipment(value,[1])
        with self.assertRaises(TypeError):M.Shipment(123,[1])
        for values in ([],[0],[-1],[True],[1.5],['2']):
            with self.subTest(values=values),self.assertRaises(ValueError):M.Shipment('a',values)
    def test_structural_provider_no_inheritance_required(self):
        seen=[]
        class LocalCarrier:
            def quote(self,shipment):seen.append(shipment);return sum(shipment.weights)*7
        shipments=[M.Shipment('a',[1,2]),M.Shipment('b',[4])]
        self.assertEqual(M.quote_batch(shipments,LocalCarrier()),[('a',21),('b',28)]);self.assertEqual(seen,shipments)
    def test_new_provider_and_order_are_not_hardcoded(self):
        class FreeCarrier:
            def quote(self,shipment):return 0
        shipments=[M.Shipment('z',[99]),M.Shipment('a',[1])]
        self.assertEqual(M.quote_batch(shipments,FreeCarrier()),[('z',0),('a',0)])
        self.assertEqual([s.identifier for s in shipments],['z','a'])
    def test_provider_contract_is_runtime_checked(self):
        for value in (True,-1,1.5,'12',None):
            with self.subTest(value=value):
                seen=[]
                shipments=[M.Shipment('first',[1]),M.Shipment('invalid',[2]),M.Shipment('must-not-call',[3])]
                class Broken:
                    def quote(self,shipment):
                        seen.append(shipment.identifier)
                        return value if shipment.identifier=='invalid' else 23
                with self.assertRaises(ValueError):M.quote_batch(shipments,Broken())
                self.assertEqual(seen,['first','invalid'])
    def test_empty_batch_has_no_provider_effect(self):
        class Unavailable:
            def quote(self,shipment):raise AssertionError('must not call')
        self.assertEqual(M.quote_batch([],Unavailable()),[])
    def test_provider_exception_preserves_identity(self):
        error=OSError('carrier');seen=[]
        shipments=[M.Shipment('first',[1]),M.Shipment('failed',[2]),M.Shipment('must-not-call',[3])]
        class Down:
            def quote(self,shipment):
                seen.append(shipment.identifier)
                if shipment.identifier=='failed':raise error
                return 23
        with self.assertRaises(OSError) as raised:M.quote_batch(shipments,Down())
        self.assertIs(raised.exception,error);self.assertEqual(seen,['first','failed'])


    def test_provider_declares_shipment_parameter(self):
        self.assertIs(typing.get_type_hints(M.QuoteProvider.quote).get('shipment'),M.Shipment)

    def test_provider_stops_at_first_invalid_amount(self):
        rows=[M.Shipment('same',[1]),M.Shipment('same',[2]),M.Shipment('tail',[3])]
        for invalid in (True,False,-1,1.5,'2',None):
            calls=[]
            class Carrier:
                def quote(self,row):
                    calls.append(row)
                    return invalid if len(calls)==2 else 7
            with self.subTest(invalid=invalid),self.assertRaises(ValueError):M.quote_batch(rows,Carrier())
            self.assertEqual(calls,rows[:2])

class Lines:
    def __init__(self,values,fail_at=None):self.values=iter(values);self.reads=0;self.closes=0;self.fail_at=fail_at;self.error=OSError('source read')
    def __iter__(self):return self
    def __next__(self):
        if self.fail_at is not None and self.reads==self.fail_at:raise self.error
        value=next(self.values);self.reads+=1;return value
    def close(self):self.closes+=1

class Streams(unittest.TestCase):
    def test_no_open_before_first_next_and_close_unstarted(self):
        calls=[]
        def factory():calls.append(1);return Lines([])
        stream=M.stream_orders(factory);self.assertEqual(calls,[]);stream.close();self.assertEqual(calls,[])
    def test_laziness_one_result_and_early_close(self):
        source=Lines(['{"id":"a","qty":1}','{"id":"b","qty":2}','invalid'])
        calls=[]
        def factory():calls.append(1);return source
        stream=M.stream_orders(factory)
        self.assertEqual(next(stream),{'id':'a','qty':1});self.assertEqual(source.reads,1);self.assertEqual(source.closes,0)
        stream.close();stream.close();self.assertEqual(source.reads,1);self.assertEqual(source.closes,1);self.assertEqual(calls,[1])
    def test_complete_stream_preserves_rows_and_closes(self):
        source=Lines(['  ','{"id":"p","qty":3}','{"id":"t","qty":5}','\n'])
        self.assertEqual(list(M.stream_orders(lambda:source)),[{'id':'p','qty':3},{'id':'t','qty':5}]);self.assertEqual(source.closes,1)
    def test_invalid_json_preserves_physical_line_and_cause(self):
        source=Lines(['\n','{"id":"a","qty":1}','bad'])
        stream=M.stream_orders(lambda:source);next(stream)
        with self.assertRaises(M.OrderFormatError) as raised:next(stream)
        self.assertEqual(raised.exception.line_number,3);self.assertIsInstance(raised.exception.__cause__,json.JSONDecodeError);self.assertEqual(source.closes,1)
    def test_bad_schema_and_bool_quantity_rejected(self):
        for record in ([],{'id':'a','qty':True},{'id':'a','qty':0},{'id':'a','qty':2,'extra':1},{'id':' ','qty':1}):
            source=Lines([json.dumps(record)])
            with self.subTest(record=record),self.assertRaises(M.OrderFormatError) as raised:list(M.stream_orders(lambda:source))
            self.assertEqual(raised.exception.line_number,1);self.assertIsInstance(raised.exception.__cause__,ValueError);self.assertEqual(source.closes,1)
    def test_source_io_error_not_disguised_as_bad_json(self):
        for fail_at in (0,1):
            with self.subTest(fail_at=fail_at):
                source=Lines(['{"id":"a","qty":1}'],fail_at=fail_at)
                stream=M.stream_orders(lambda:source)
                if fail_at:next(stream)
                with self.assertRaises(OSError) as raised:next(stream)
                self.assertIs(raised.exception,source.error);self.assertEqual(source.closes,1)
                stream.close();self.assertEqual(source.closes,1)
    def test_factory_failure_does_not_fabricate_data(self):
        error=OSError('open')
        def factory():raise error
        with self.assertRaises(OSError) as raised:list(M.stream_orders(factory))
        self.assertIs(raised.exception,error)
    def test_empty_source_closes(self):
        source=Lines([]);self.assertEqual(list(M.stream_orders(lambda:source)),[]);self.assertEqual(source.closes,1)

    def test_pipeline_zero_limit_never_opens_or_filters(self):
        def forbidden(*args):raise AssertionError('must not run')
        self.assertEqual(list(M.take_matching(forbidden,forbidden,0)),[])
        for limit in (-1,True,1.5):
            with self.subTest(limit=limit),self.assertRaises(ValueError):list(M.take_matching(forbidden,forbidden,limit))
    def test_pipeline_stops_at_limit_without_reading_bad_tail(self):
        source=Lines(['{"id":"a","qty":1}','{"id":"b","qty":2}','bad'])
        tested=[]
        def select(row):tested.append(row['id']);return row['qty']>=2
        pipeline=M.take_matching(lambda:source,select,1)
        self.assertEqual(next(pipeline),{'id':'b','qty':2})
        self.assertEqual(source.reads,2);self.assertEqual(source.closes,1);self.assertEqual(tested,['a','b'])
        self.assertEqual(list(pipeline),[]);self.assertEqual(source.closes,1)
    def test_pipeline_early_consumer_close_propagates(self):
        source=Lines(['{"id":"a","qty":1}','{"id":"b","qty":2}'])
        pipeline=M.take_matching(lambda:source,lambda row:True,9)
        next(pipeline);pipeline.close()
        self.assertEqual(source.reads,1);self.assertEqual(source.closes,1)
    def test_pipeline_predicate_failure_preserves_identity_and_closes(self):
        source=Lines(['{"id":"a","qty":1}']);error=ValueError('predicate')
        def broken(row):raise error
        with self.assertRaises(ValueError) as raised:list(M.take_matching(lambda:source,broken,2))
        self.assertIs(raised.exception,error);self.assertEqual(source.closes,1)
    def test_pipeline_no_match_and_upstream_failure(self):
        source=Lines(['{"id":"a","qty":1}','{"id":"b","qty":2}'])
        self.assertEqual(list(M.take_matching(lambda:source,lambda row:False,3)),[]);self.assertEqual(source.closes,1)
        bad=Lines(['{"id":"a","qty":1}','bad'])
        with self.assertRaises(M.OrderFormatError):list(M.take_matching(lambda:bad,lambda row:False,3))
        self.assertEqual(bad.closes,1)


    def test_full_schema_boundary_preserves_format_error(self):
        records=[None,3,'text',{}, {'id':'a'},{'qty':1},
                 {'id':1,'qty':1},{'id':False,'qty':1},{'id':None,'qty':1},{'id':['a'],'qty':1},
                 {'id':'a','qty':-1},{'id':'a','qty':False},{'id':'a','qty':1.5},{'id':'a','qty':'2'},{'id':'a','qty':None}]
        for record in records:
            source=Lines(['  ',json.dumps(record)])
            with self.subTest(record=record),self.assertRaises(M.OrderFormatError) as caught:list(M.stream_orders(lambda:source))
            self.assertEqual(caught.exception.line_number,2)
            self.assertIsInstance(caught.exception.__cause__,ValueError)
            self.assertEqual(source.closes,1)

    def test_read_failure_preserves_exact_exception_object(self):
        for after in (0,1):
            error=OSError('specific read error')
            class Failing(Lines):
                def __next__(self):
                    if self.reads==after:raise error
                    return super().__next__()
            source=Failing(['{"id":"ok","qty":1}'])
            with self.subTest(after=after),self.assertRaises(OSError) as caught:list(M.stream_orders(lambda:source))
            self.assertIs(caught.exception,error)
            self.assertEqual(source.closes,1)

    def test_pipeline_multiple_results_keep_order_and_close_at_limit(self):
        source=Lines(['{"id":"skip","qty":1}','{"id":"first","qty":2}',
                      '{"id":"skip-again","qty":1}','{"id":"last","qty":3}','bad-tail'])
        seen=[]
        def predicate(row):seen.append(row['id']);return row['qty']>1
        stream=M.take_matching(lambda:source,predicate,2)
        self.assertEqual(next(stream),{'id':'first','qty':2})
        self.assertEqual(source.reads,2);self.assertEqual(source.closes,0)
        self.assertEqual(next(stream),{'id':'last','qty':3})
        self.assertEqual(source.reads,4);self.assertEqual(source.closes,1)
        self.assertEqual(list(stream),[])
        self.assertEqual(seen,['skip','first','skip-again','last'])
        self.assertEqual(source.closes,1)

    def test_pipeline_exhaustion_below_quota_preserves_all_matches(self):
        source=Lines(['{"id":"one","qty":2}','{"id":"two","qty":3}'])
        self.assertEqual(list(M.take_matching(lambda:source,lambda row:True,5)),[{'id':'one','qty':2},{'id':'two','qty':3}])
        self.assertEqual(source.reads,2);self.assertEqual(source.closes,1)

    def test_pipeline_unstarted_close_never_opens(self):
        calls=[]
        def factory():calls.append('open');return Lines([])
        stream=M.take_matching(factory,lambda row:True,3)
        stream.close()
        self.assertEqual(calls,[])
