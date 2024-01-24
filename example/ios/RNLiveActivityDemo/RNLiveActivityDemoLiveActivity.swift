//
//  RNLiveActivityDemoLiveActivity.swift
//  RNLiveActivityDemo
//
//  Created by Pushly on 1/23/24.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct RNLiveActivityDemoAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var value: Int
        var color: Int
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct RNLiveActivityDemoLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RNLiveActivityDemoAttributes.self) { context in
            // Lock screen/banner UI goes here
            ZStack {
              VStack {
                HStack {
                  Text("Live Activity Demo")
                    .font(.title2)
                    .bold()
                    .foregroundColor(Color(hex: context.state.color))
                  }
                  .frame(maxWidth: .infinity, alignment: .leading)

                  HStack {
                    Text("Current Value = \(context.state.value)")
                      .font(.body)
                      .foregroundColor(Color(hex: context.state.color))
                  }
                  .frame(maxWidth: .infinity, alignment: .leading)
              }
              .padding(20)
          }
          .activityBackgroundTint(.clear)

        } dynamicIsland: { context in
          DynamicIsland {
              // Expanded UI goes here.  Compose the expanded UI through
              // various regions, like leading/trailing/center/bottom
              DynamicIslandExpandedRegion(.leading) {
                Text("ReactNative")
              }
              DynamicIslandExpandedRegion(.trailing) {
                Text("LiveActivities")
              }
              DynamicIslandExpandedRegion(.bottom) {
                VStack {
                  HStack {
                    Text("Live Activity Demo")
                      .font(.title2)
                      .bold()
                      .foregroundColor(Color(hex: context.state.color))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                  HStack {
                    Text("Current Value = \(context.state.value)")
                      .font(.body)
                      .foregroundColor(Color(hex: context.state.color))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                  }
                  .padding(20)
              }
          } compactLeading: {
              Text("RN")
          } compactTrailing: {
              Text("LA \(context.state.value)")
          } minimal: {
              Text(String(context.state.value))
          }
          .widgetURL(URL(string: "http://www.apple.com"))
          .keylineTint(Color.red)
        }
    }
}

extension RNLiveActivityDemoAttributes {
    fileprivate static var preview: RNLiveActivityDemoAttributes {
        RNLiveActivityDemoAttributes(name: "World")
    }
}

extension RNLiveActivityDemoAttributes.ContentState {
    fileprivate static var smiley: RNLiveActivityDemoAttributes.ContentState {
        RNLiveActivityDemoAttributes.ContentState(value: 0, color: 0x4dbcdd)
     }

     fileprivate static var starEyes: RNLiveActivityDemoAttributes.ContentState {
         RNLiveActivityDemoAttributes.ContentState(value: 30, color: 0xffffff)
     }
}

#Preview("Notification", as: .content, using: RNLiveActivityDemoAttributes.preview) {
   RNLiveActivityDemoLiveActivity()
} contentStates: {
    RNLiveActivityDemoAttributes.ContentState.smiley
    RNLiveActivityDemoAttributes.ContentState.starEyes
}

extension Color {
    init(hex: Int, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 08) & 0xff) / 255,
            blue: Double((hex >> 00) & 0xff) / 255,
            opacity: opacity
        )
    }
}

extension UIColor {
    convenience init(hex: Int, opacity: Double = 1) {
        self.init(
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 08) & 0xff) / 255,
            blue: Double((hex >> 00) & 0xff) / 255,
            alpha: opacity
        )
    }
}
