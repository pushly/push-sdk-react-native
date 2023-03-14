//
//  NotificationService.m
//  ExampleNotificationServiceExtension
//
//  Created by Adam Hay on 3/2/23.
//

#import "NotificationService.h"
#import <Pushly/Pushly.h>

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    
    [PNNotificationServiceExtensionHandler didReceiveExtensionRequest:request content:self.bestAttemptContent withContentHandler:contentHandler];
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    [PNNotificationServiceExtensionHandler didRecieveExtensionTimeWillExpire:self.bestAttemptContent withContentHandler:self.contentHandler];

    self.contentHandler(self.bestAttemptContent);
}

@end
