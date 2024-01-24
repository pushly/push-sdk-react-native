//
//  LiveActivity.m
//  PushSdkReactNativeExample
//
//  Created by Pushly on 1/23/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivity, NSObject)

  RCT_EXTERN_METHOD(startLiveActivity:(NSString)activityId
                    withResolver:(RCTPromiseResolveBlock)resolve
                    withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL) requiresMainQueueSetup
{
  return "NO";
}
@end
