import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

import AsyncStorage from '@react-native-community/async-storage';

import FetchSubscriptionReducer from './FetchSubscriptionReducer';
import FetchGymServiceReducer from './fetchGymServiceReducer';
import FacilitygymReducer from './facilitygymReducer';
import FetchMemberReducer from './FetchMemberReducer';
import addOrEditsupPlanReducer from './addOrEditsupPlanReducer';
import addOrEditMember from './addOrEditMember';
import getAllCityReducer from './getAllCityReducer';
import fetchQuotesReducer from './fetchQuotesReducer';
import getallNotificationReducer from './getallNotificationReducer';
import userTypeCountReducer from './userTypeCountReducer';
import imageGalleryReducer from './imageGalleryReducer';
import getMembershipPlanReducer from './getMembershipPlanReducer';
import addPlanRedux from './addPlanRedux';
import ownerPaytmRedux from './ownerPaytmRedux';
import SendOtpRedux from './SendOtpRedux';
import getAllReferral from './getAllReferralReferralReducer';
import ReferralWithdrawReq from './referral_withdrawReducer';
import allBalanceReducer from './all_balanceReducer';
import MemberDetailReducer from './MemberDetailReducer';
import fetchExercise_listRedux from './fetchExercise_listRedux';
import fetchworkoutlistReducer from './fetchworkoutlistReducer';
import addWorkOutReducer from './addWorkOutReducer';
import workoutDetailReducer from './workoutDetailReducer';
import fetchAllAttendanceReducer from './fetchAllAttendanceReducer';
import paymentSettingReducer from './paymentSettingReducer';
import activePlanReducer from './activePlanReducer';
import getDashboardDetailReducer from './getDashboardDetailReducer';
import NotifyApiReducer from './NotifyApiReducer';
import LoginBalanceSheetReducer from './LoginBalanceSheetReducer';
import RegisterReducerReducer from './RegisterReducerReducer';
import DeleteMemberReducer from './DeleteMemberReducer';
import RecievePaymentReducer from './RecievePaymentReducer';
import RenewMemberReducer from './RenewMemberReducer';
import RenewMessageReducer from './RenewMessageReducer';
import BodyPartListReducer from './BodyPartListReducer';
import assignToMemberReducer from './assignToMemberReducer';
import aboutcommentReducer from './aboutcommentReducer';
import urlAddGymReducer from './urlAddGymReducer';
import SearchGymReducer from './SearchGymReducer';
import SendNotifictationReducer from './SendNotifictationReducer';
import memberAllGymReducer from './memberAllGymReducer';
import assignTrainerReducer from './assignTrainerReducer';
import getmygymReducer from './getmygymReducer';
import MemberShipForMemberReducer from './MemberShipForMemberReducer';
import GetMemberbyMobileReducer from './GetMemberbyMobileReducer';

import gymReducer from './gymReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['getDashboardDetailReducer'],
};
const rootReducer = combineReducers({
  BodyPartListReducer,
  FetchSubscriptionReducer,
  FetchGymServiceReducer,
  FacilitygymReducer,
  FetchMemberReducer,
  addOrEditsupPlanReducer,
  addOrEditMember,
  getAllCityReducer,
  fetchQuotesReducer,
  getallNotificationReducer,
  userTypeCountReducer,
  gymReducer,
  imageGalleryReducer,
  getMembershipPlanReducer,
  addPlanRedux,
  ownerPaytmRedux,
  SendOtpRedux,
  getAllReferral,
  ReferralWithdrawReq,
  allBalanceReducer,
  MemberDetailReducer,
  fetchExercise_listRedux,
  fetchworkoutlistReducer,
  addWorkOutReducer,
  workoutDetailReducer,
  paymentSettingReducer,
  fetchAllAttendanceReducer,
  activePlanReducer,
  getDashboardDetailReducer,
  NotifyApiReducer,
  LoginBalanceSheetReducer,
  RegisterReducerReducer,
  DeleteMemberReducer,
  RecievePaymentReducer,
  RenewMemberReducer,
  RenewMessageReducer,
  assignToMemberReducer,
  aboutcommentReducer,
  urlAddGymReducer,
  SearchGymReducer,
  SendNotifictationReducer,
  memberAllGymReducer,
  assignTrainerReducer,
  getmygymReducer,
  MemberShipForMemberReducer,
  GetMemberbyMobileReducer,
});

export default persistReducer(persistConfig, rootReducer);
// export default rootReducer;
