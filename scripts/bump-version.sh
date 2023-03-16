#!/bin/sh

NEW_VERSION="$1"

sed -i '' "s/\"version\": \"[0-9].[0-9].[0-9]\"/\"version\": \"$NEW_VERSION\"/" package.json
sed -i '' "s/MODULE_VERSION = \"[0-9].[0-9].[0-9]\"/MODULE_VERSION = \"$NEW_VERSION\"/" ./ios/PushSdkReactBridge.swift
sed -i '' "s/moduleVersion = '[0-9].[0-9].[0-9]'/moduleVersion = '$NEW_VERSION'/" ./android/build.gradle
