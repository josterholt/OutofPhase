class MobEncoder():
    def encode(self, objects):
        dicts = []
        for o in objects:
            dicts.append(o.__dict__)
        return dicts