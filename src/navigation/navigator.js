import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
} from 'react-navigation';
import React from 'react';
import {Image, View, Platform} from 'react-native';
import Splash from '../screens/Splash';
import Login from '../screens/Login';
import StartScreen from '../screens/StartScreen';
// import StartScreenIOS from '../screens/StartScreenIOS';
import MembershipTab from '../screens/MembershipTab';
import MembersTab from '../screens/MembersTab';
import HomeTab from '../screens/HomeTab';
import WorkoutTab from '../screens/WorkoutTab';
import ProfileTab from '../screens/ProfileTab';
import AddOrEditMember from '../screens/AddOrEditMember';
import AddStaff from '../screens/AddStaff';
import AddGuest from '../screens/AddGuest';
import AddOrEditMembershipPlan from '../screens/AddOrEditMembershipPlan';
import SubscribePlanForMember from '../screens/SubscribePlanForMember';
import MemberDetailsScreen from '../screens/MemberDetailsScreen';
import ReceivePayment from '../screens/ReceivePayment';
import AssignToMembersScreen from '../screens/AssignToMembersScreen';
import WorkoutDetails from '../screens/WorkoutDetails';
import CreateOrEditWorkout from '../screens/CreateOrEditWorkout';
import AddExerciseToWorkout from '../screens/AddExerciseToWorkout';
import ExerciseDetails from '../screens/ExerciseDetails';
import ExerciseVideo from '../screens/ExerciseVideo';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ProfileSelectionForRegister from '../screens/ProfileSelectionForRegister';
import EditProfileInfo from '../screens/EditProfileInfo';
import EditBMIDetails from '../screens/EditBMIDetails';
import EditGymProfile from '../screens/EditGymProfile';
import ItemSelectScreen from '../screens/ItemSelectScreen';
import Settings from '../screens/Settings';
import NotificationsScreen from '../screens/NotificationsScreen';
import SendNotification from '../screens/SendNotification';
import BalanceSheet from '../screens/BalanceSheet';
import PinCodeScreen from '../screens/PinCodeScreen';
import BalanceSheetSettings from '../screens/BalanceSheetSettings';
import MembershipPlans from '../screens/MembershipPlans';
import MembershipPlanDetails from '../screens/MembershipPlanDetails';
import Webview from '../screens/Webview';
import QRCodeScreen from '../screens/QRCodeScreen';
import QRCodeScanner from '../screens/QRCodeScanner';
import Referral from '../screens/Referral';
import ReferralWithdrawalRequest from '../screens/ReferralWithdrawalRequest';
import GymList from '../screens/GymList';
import MemberGymList from '../screens/MemberGymList';
import AddNewGym from '../screens/AddNewGym';
import IntroScreen from '../screens/IntroScreen';
import GuestDetailsScreen from '../screens/GuestDetailsScreen';
import TakePicture from '../screens/TakePicture';
import SelectImageFromGallery from '../screens/SelectImageFromGallery';
import PayWithPaytm from '../screens/PayWithPaytm';
import GymDetailsScreen from '../screens/GymDetailsScreen';
import GymSearchScreen from '../screens/GymSearchScreen';
import RenewMembershipWithPaytm from '../screens/RenewMembershipWithPaytm';
/*
import GymServicesScreen from '../screens/GymServicesScreen';
import GymFacilitiesScreen from '../screens/GymFacilitiesScreen';
import GymGalleryScreen from '../screens/GymGalleryScreen';
import GymSubscriptionsScreen from '../screens/GymSubscriptionsScreen';
*/

const authStackNavigator = createStackNavigator(
  {
    StartScreen: {
      screen: StartScreen,
    },
    Login: {
      screen: Login,
    },
    OTPVerificationScreen: {
      screen: OTPVerificationScreen,
    },
    ProfileSelectionForRegister: {
      screen: ProfileSelectionForRegister,
    },
    EditProfileInfo: {
      screen: EditProfileInfo,
    },
    EditBMIDetails: {
      screen: EditBMIDetails,
    },
    EditGymProfile: {
      screen: EditGymProfile,
    },
    ItemSelectScreen: {
      screen: ItemSelectScreen,
    },
    AddOrEditMembershipPlan: {
      screen: AddOrEditMembershipPlan,
    },
    SelectImageFromGalleryForRegistration: {
      screen: SelectImageFromGallery,
    },
    TakePictureForRegistration: {
      screen: TakePicture,
    },
  },
  {
    headerMode: 'none',
  },
);

const membersStackNavigator = createStackNavigator(
  {
    Members: {
      screen: MembersTab,
    },
  },
  {
    headerMode: 'none',
  },
);

const membershipTabStackNavigator = createStackNavigator(
  {
    Membership: {
      screen: MembershipTab,
    },
  },
  {
    headerMode: 'none',
  },
);

const workoutTabStackNavigator = createStackNavigator(
  {
    Workout: {
      screen: WorkoutTab,
    },
    AssignToMembersScreen: {
      screen: AssignToMembersScreen,
    },
  },
  {
    headerMode: 'none',
  },
);

const bottomTabNavigator = createBottomTabNavigator(
  {
    MembershipTab: {
      screen: membershipTabStackNavigator,
      navigationOptions: {
        header: null,
        tabBarLabel: 'Membership',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/membership_tabbar_icon.png')}
              //style={{width:32, height:24}}
              style={{width: 23, height: 17.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
    MembersTab: {
      screen: membersStackNavigator,
      navigationOptions: {
        header: null,
        tabBarLabel: 'Members',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/members_tabbar_icon.png')}
              //style={{width:29, height:24}}
              style={{width: 21, height: 17.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
    HomeTab: {
      screen: HomeTab,
      navigationOptions: {
        header: null,
        tabBarLabel: ({focused}) => {
          return null;
        },
        tabBarVisible: false,
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <View
              style={{
                backgroundColor: '#17aae0',
                justifyContent: 'center',
                alignItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 20,
              }}>
              <Image
                focused={focused}
                source={require('../../assets/images/home_tabbar_icon.png')}
                //style={{width:27, height:24}}
                style={{width: 24.5, height: 21.5}}
                tintColor={'white'}
              />
            </View>
          );
        },
      },
    },
    WorkoutTab: {
      screen: workoutTabStackNavigator,
      navigationOptions: {
        header: null,
        tabBarLabel: 'Workout',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/workout_tabbar_icon.png')}
              //style={{width:32, height:15}}
              style={{width: 28, height: 13.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
    ProfileTab: {
      screen: ProfileTab,
      navigationOptions: {
        header: null,
        tabBarLabel: 'Profile',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/profile_tabbar_icon.png')}
              //style={{width:24, height:24}}
              style={{width: 17.5, height: 17.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
  },
  {
    tabBarOptions: {
      activeTintColor: '#121619',
      inactiveTintColor: '#8e9092',
      labelStyle: {
        fontSize: 12,
      },
      showIcon: true,
      //iconStyle: { width: 30, height: 30, margin: 0, padding: 0},
      tabStyle: {height: 50, paddingBottom: 5},
    },
    initialRouteName: 'HomeTab',
  },
);

const homeNavigator = createStackNavigator(
  {
    MainTab: {
      screen: bottomTabNavigator,
    },
    SubscribePlanForMember: {
      screen: SubscribePlanForMember,
    },
    CreateMembershipPlan: {
      screen: AddOrEditMembershipPlan,
    },
    AddOrEditMembershipPlan: {
      screen: AddOrEditMembershipPlan,
    },
    AddStaff: {
      screen: AddStaff,
    },
    AddOrEditMember: {
      screen: AddOrEditMember,
    },
    AddGuest: {
      screen: AddGuest,
    },
    MemberDetailsScreen: {
      screen: MemberDetailsScreen,
    },
    GuestDetailsScreen: {
      screen: GuestDetailsScreen,
    },
    ReceivePayment: {
      screen: ReceivePayment,
    },
    WorkoutDetails: {
      screen: WorkoutDetails,
    },
    CreateOrEditWorkout: {
      screen: CreateOrEditWorkout,
    },
    AddExerciseToWorkout: {
      screen: AddExerciseToWorkout,
    },
    ExerciseDetails: {
      screen: ExerciseDetails,
    },
    ExerciseVideo: {
      screen: ExerciseVideo,
    },
    Settings: {
      screen: Settings,
    },
    NotificationsScreen: {
      screen: NotificationsScreen,
    },
    SendNotification: {
      screen: SendNotification,
    },
    BalanceSheet: {
      screen: BalanceSheet,
    },
    PinCodeScreen: {
      screen: PinCodeScreen,
    },
    BalanceSheetSettings: {
      screen: BalanceSheetSettings,
    },
    MembershipPlans: {
      screen: MembershipPlans,
    },
    MembershipPlanDetails: {
      screen: MembershipPlanDetails,
    },
    Webview: {
      screen: Webview,
    },
    QRCodeScreen: {
      screen: QRCodeScreen,
    },
    QRCodeScanner: {
      screen: QRCodeScanner,
    },
    Referral: {
      screen: Referral,
    },
    ReferralWithdrawalRequest: {
      screen: ReferralWithdrawalRequest,
    },
    GymList: {
      screen: GymList,
    },
    AddNewGym: {
      screen: AddNewGym,
    },
    GymCitySelectionScreen: {
      screen: ItemSelectScreen,
    },
    TakePicture: {
      screen: TakePicture,
    },
    SelectImageFromGallery: {
      screen: SelectImageFromGallery,
    },
    PayWithPaytm: {
      screen: PayWithPaytm,
    },
  },
  {
    headerMode: 'none',
  },
);

const memberAboutStackNavigator = createStackNavigator(
  {
    MemberAbout: {
      screen: MemberDetailsScreen,
    },
  },
  {
    headerMode: 'none',
  },
);

const memberBottomTabNavigator = createBottomTabNavigator(
  {
    MemberAboutTab: {
      screen: memberAboutStackNavigator,
      navigationOptions: {
        header: null,
        tabBarLabel: 'About',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/about_tab_icon.png')}
              //style={{width:32, height:24}}
              style={{width: 7, height: 20}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
    MemberQRScannerTab: {
      screen: QRCodeScanner,
      navigationOptions: {
        header: null,
        tabBarLabel: 'QR-Scanner',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/qrscanner_tab_icon.png')}
              //style={{width:29, height:24}}
              style={{width: 17.5, height: 17.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
    HomeTab: {
      screen: HomeTab,
      navigationOptions: {
        header: null,
        tabBarLabel: ({focused}) => {
          return null;
        },
        tabBarVisible: false,
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <View
              style={{
                backgroundColor: '#17aae0',
                justifyContent: 'center',
                alignItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 20,
              }}>
              <Image
                focused={focused}
                source={require('../../assets/images/home_tabbar_icon.png')}
                //style={{width:27, height:24}}
                style={{width: 24.5, height: 21.5}}
                tintColor={'white'}
              />
            </View>
          );
        },
      },
    },
    WorkoutTab: {
      screen: workoutTabStackNavigator,
      navigationOptions: {
        header: null,
        tabBarLabel: 'Workout',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/workout_tabbar_icon.png')}
              //style={{width:32, height:15}}
              style={{width: 28, height: 13.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
    ProfileTab: {
      screen: ProfileTab,
      navigationOptions: {
        header: null,
        tabBarLabel: 'Profile',
        tabBarIcon: ({focused, tintColor}) => {
          return (
            <Image
              focused={focused}
              source={require('../../assets/images/profile_tabbar_icon.png')}
              //style={{width:24, height:24}}
              style={{width: 17.5, height: 17.5}}
              tintColor={tintColor}
            />
          );
        },
      },
    },
  },
  {
    tabBarOptions: {
      activeTintColor: '#121619',
      inactiveTintColor: '#8e9092',
      labelStyle: {
        fontSize: 12,
      },
      showIcon: true,
      //iconStyle: { width: 30, height: 30, margin: 0, padding: 0},
      tabStyle: {height: 50, paddingBottom: 5},
    },
    initialRouteName: 'HomeTab',
  },
);

const memberHomeNavigator = createStackNavigator(
  {
    MemberMainTab: {
      screen: memberBottomTabNavigator,
    },
    SubscribePlanForMember: {
      screen: SubscribePlanForMember,
    },
    CreateMembershipPlan: {
      screen: AddOrEditMembershipPlan,
    },
    AddOrEditMembershipPlan: {
      screen: AddOrEditMembershipPlan,
    },
    AddStaff: {
      screen: AddStaff,
    },
    AddOrEditMember: {
      screen: AddOrEditMember,
    },
    AddGuest: {
      screen: AddGuest,
    },
    GuestDetailsScreen: {
      screen: GuestDetailsScreen,
    },
    ReceivePayment: {
      screen: ReceivePayment,
    },
    WorkoutDetails: {
      screen: WorkoutDetails,
    },
    CreateOrEditWorkout: {
      screen: CreateOrEditWorkout,
    },
    AddExerciseToWorkout: {
      screen: AddExerciseToWorkout,
    },
    ExerciseDetails: {
      screen: ExerciseDetails,
    },
    ExerciseVideo: {
      screen: ExerciseVideo,
    },
    Settings: {
      screen: Settings,
    },
    NotificationsScreen: {
      screen: NotificationsScreen,
    },
    SendNotification: {
      screen: SendNotification,
    },
    BalanceSheet: {
      screen: BalanceSheet,
    },
    PinCodeScreen: {
      screen: PinCodeScreen,
    },
    BalanceSheetSettings: {
      screen: BalanceSheetSettings,
    },
    MembershipPlans: {
      screen: MembershipPlans,
    },
    MembershipPlanDetails: {
      screen: MembershipPlanDetails,
    },
    Webview: {
      screen: Webview,
    },
    QRCodeScreen: {
      screen: QRCodeScreen,
    },
    QRCodeScanner: {
      screen: QRCodeScanner,
    },
    Referral: {
      screen: Referral,
    },
    ReferralWithdrawalRequest: {
      screen: ReferralWithdrawalRequest,
    },
    MemberGymList: {
      screen: MemberGymList,
    },
    AddNewGym: {
      screen: AddNewGym,
    },
    GymCitySelectionScreen: {
      screen: ItemSelectScreen,
    },
    TakePicture: {
      screen: TakePicture,
    },
    SelectImageFromGallery: {
      screen: SelectImageFromGallery,
    },
    PayWithPaytm: {
      screen: PayWithPaytm,
    },
    MemberMembershipTab: {
      screen: MembershipTab,
    },
    GymDetailsScreen: {
      screen: GymDetailsScreen,
    },
    GymSearchScreen: {
      screen: GymSearchScreen,
    },
    ItemSelectScreen: {
      screen: ItemSelectScreen,
    },
    RenewMembershipWithPaytm: {
      screen: RenewMembershipWithPaytm,
    },
  },
  {
    headerMode: 'none',
  },
);

const appSwitchNavigator = createSwitchNavigator(
  {
    Splash: {
      screen: Splash,
    },
    IntroScreen: {
      screen: IntroScreen,
    },
    Auth: {
      screen: authStackNavigator,
    },
    MainApp: {
      screen: homeNavigator,
    },
    MemberMainApp: {
      screen: memberHomeNavigator,
    },
  },
  {
    headerMode: 'none',
  },
);

const appContainer = createAppContainer(appSwitchNavigator);

export default appContainer;
