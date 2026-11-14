import builtins


def protect_exported_types(exports):
    snapshots = {}
    for module_name, names in exports.items():
        module = builtins.__import__(module_name)
        for name in names:
            value = getattr(module, name, None)
            if isinstance(value, type) and id(value) not in snapshots:
                snapshots[id(value)] = (value, dict(vars(value)))
    def restore():
        changed = False
        for cls, original in snapshots.values():
            current = dict(vars(cls))
            for name in current.keys() - original.keys():
                type.__delattr__(cls, name)
                changed = True
            for name, value in original.items():
                if name not in current or current[name] is not value:
                    type.__setattr__(cls, name, value)
                    changed = True
        return changed
    return restore
