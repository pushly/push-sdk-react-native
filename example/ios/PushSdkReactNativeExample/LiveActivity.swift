//
//  LiveActivity.swift
//  PushSdkReactNativeExample
//
//  Created by Pushly on 1/23/24.
//

import Foundation
import ActivityKit
import Pushly

@objc(LiveActivity)
class LiveActivity: NSObject, RCTBridgeModule {
  @objc
  static func moduleName() -> String! {
    "\(self)"
  }

  @objc(startLiveActivity:withResolver:withRejecter:)
  func startLiveActivity(_ activityId: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    if #available(iOS 16.1, *) {
      let attr = RNLiveActivityDemoAttributes(name: "Local")
      let cs = RNLiveActivityDemoAttributes.ContentState(value: 0, color: 0x4dbcaf)

      if let activity = try? Activity.request(
          attributes: attr,
          content: .init(state: cs, staleDate: nil),
          pushType: .token) {

          Task {
              for await pushToken in activity.pushTokenUpdates {
                  let token = pushToken.reduce("") { $0 + String(format: "%02.2hhx", $1) }
                  PushSDK.LiveActivities.register(token: token, forActivity: activityId)
              }
          }
      }
    }
  }
}
