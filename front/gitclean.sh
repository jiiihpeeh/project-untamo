#!/bin/bash

# A script that squashes your entire current branch down to a single commit,
# if this repository has a single root commit.  This will change the object
# name of the root commit.

if [ -n "$(git status --porcelain)" ]
then
    echo "git status wasn't clean - refusing to run..."
    exit 1
fi

# From: http://stackoverflow.com/questions/1006775/
root_commits () {
   git rev-list --parents HEAD | egrep "^[a-f0-9]{40}$"
}

NUMBER_OF_ROOT_COMMITS=$(root_commits|wc -l)

if (( "$NUMBER_OF_ROOT_COMMITS" > 1 ))
then
    echo "This script won't work when you have multiple root commits"
    exit 1
fi

ROOT_COMMIT=$(root_commits)

if [ -z "$ROOT_COMMIT" ]
then
    echo "No root commit was found!"
    exit 1
fi

set -e
set -x

# Create a branch based on the current HEAD for safety:
git branch old-master

# Reset the branch to the root commit, leaving the previous
# state of the tree staged:
git reset --soft $ROOT_COMMIT

# Now amend the root commit with the state of the index:
git commit --amend -m "The branch restarted"
