#!/usr/bin/env python3

import os, json

files = os.listdir('audio-resources/')


unique_content = []

for i in files:
    if i != "resource_list.json":
        unique_content.append(i.rsplit('.', 1)[0])

with open("audio-resources/resource_list.json", "w") as f:
    f.writelines(json.dumps(list(set(unique_content))))
