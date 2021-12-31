import {Platform} from 'react-native';
import firebase from 'react-native-firebase';

export const displayLocalNotification = async (notification) => {
  const {title, body, sound} = notification;
  const notification22 = new firebase.notifications.Notification()
    .setNotificationId('notificationId')
    .setTitle(title)
    .setBody(body)
    .setSound(sound)
    // .android.setSmallIcon('ic_mir_notification')
    .android.setColor('red')
    .android.setPriority(firebase.notifications.Android.Priority.Max)
    .android.setChannelId('test-channel')
    .setData(notification.data ? notification.data : notification);

  // if (notification.android && Platform.OS === 'android') {
  //   notification22.android
  //     .setBigPicture(notification.android.largeIcon)
  //     .android.setLargeIcon(notification.android.largeIcon);
  // }

  await firebase.notifications().displayNotification(notification22);
};
