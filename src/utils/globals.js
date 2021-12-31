import AsyncStorage from '@react-native-community/async-storage';

var _setting = {
    userInfo: null,
    isLoggedIn: false,
    userAccountSetupStatus:'',
    initital_tab_index: 0,
    isPushNotificationsOn: true,
    member: 0,
    willShowIntro: true,
    canUsePaidFeatures: false,
    totalAddOn: 0,
    membershipExpireDate: "",
    oneSignalUserID: "",
    stateId:"",
};

var _motivationalQuotes = [
    "Pain is weakness leaving the body",
    "Being defeated is often a temporary condition. Giving up is what makes it permanent",
    "Failure is only a temporary change in direction to set you straight for your next success",
    "The worst thing you can be is average",
    "When it starts to hurt, thats when the set starts",
    "To achieve something you’ve never had before, you must do something you’ve never done before",
    "You don’t demand respect, you earn it",
    "Expecting the world to treat you fairly because you’re an honest person is like expecting the bull not to charge you because you’re a vegetarian",
    "Be proud, but never satisfied",
    "Obsession is what lazy people call dedication",
    "The best way to predict your future is to create it",
    "Your limitation—it’s only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Sometimes later becomes never. Do it now.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It’s going to be hard, but hard does not mean impossible.",
    "Don’t wait for opportunity. Create it.",
    "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles.",
    "Dream it. Believe it. Build it."
];

const KEY_SETTINGS = "settings";
const KEY_MOTIVATIONAL_QUOTES = "motivational_quotes";

export const KEY_USER_INFO = "userInfo";
export const KEY_IS_USER_LOGGED_IN = "isLoggedIn";
export const KEY_USER_ACCOUNT_SETUP_STATUS = "userAccountSetupStatus";
export const KEY_WILL_SHOW_INTRO = "willShowIntro";
export const KEY_CAN_USE_PAID_FEATURES = "canUsePaidFeatures";
export const KEY_TOTAL_ADDON = "totalAddOn";
export const KEY_MEMBERSHIP_EXPIRE_DATE = "membershipExpireDate";
export const KEY_ONESIGNAL_USER_ID = "oneSignalUserID";

export const KEY_ACCOUNT_SETUP_STATUS_OWNER_CREATED = "ownerCreated";
export const KEY_ACCOUNT_SETUP_STATUS_MEMBER_CREATED = "memberCreated";
export const KEY_ACCOUNT_SETUP_STATUS_USER_INFO_ADDED = "userInfoAdded";
export const KEY_ACCOUNT_SETUP_STATUS_GYM_ADDED = "gymAdded";
export const KEY_ACCOUNT_SETUP_STATUS_GYM_SERVICES_DONE = "gymServicesDone";
export const KEY_ACCOUNT_SETUP_STATUS_GYM_FACILITIES_DONE = "gymFacilitiesDone";
export const KEY_ACCOUNT_SETUP_STATUS_GYM_GALLERY_DONE = "gymGalleryDone";
export const KEY_ACCOUNT_SETUP_STATUS_GYM_SUBSCRIPTIONS_DONE = "gymSubscriptionsDone";
export const KEY_ACCOUNT_SETUP_STATUS_USER_DETAILS_ADDED = "userDetailsAdded";
export const KEY_ACCOUNT_SETUP_STATUS_USER_BMI_DETAILS_ADDED = "userBMIDetailsAdded";
export const KEY_ACCOUNT_SETUP_STATUS_FINISHED = "accountSetupFinished";

export function getSetting() {return _setting};
export async function setOneSetting(key, val) {
    _setting[key] = val;
    await saveToStorage(KEY_SETTINGS, _setting);
}
export function setSetting(setting) {
    _setting = setting;
    saveToStorage(KEY_SETTINGS, _setting);
}

export function getMotivationalQuotes() {return _motivationalQuotes};
export function addMotivationQuote(quote) {
    _motivationalQuotes.push(quote);
    saveToStorage(KEY_MOTIVATIONAL_QUOTES, _motivationalQuotes);
}
export function setMotivationalQuotes(quotes) {
    _motivationalQuotes = quotes;
    saveToStorage(KEY_MOTIVATIONAL_QUOTES, _motivationalQuotes);
};

export async function storeData(key, value) {
    try {
        await AsyncStorage.setItem(key, value);
    } catch(error) {
        //console.log('Saving data \"%s\" is failed.', key);
    }
}

export async function loadData(key) {
    try {
        const value = await AsyncStorage.getItem(key)
        return value;
      } catch(e) {
        // error reading value
        //console.log("Error in loading data \"%s\"", key);
        return undefined;
      }
}

export async function removeFromStorage(key) {
    try {
        await AsyncStorage.removeItem(key);
        //console.log("Removed Info:", key);
    } catch(error) {
        //console.log("Removing Info Failed: ", error.message);
    }
}

export async function getFromStorage(key) {
    try {
        const info = await AsyncStorage.getItem(key);
        if (info) {
            // logged before, so go to users scene
            // //console.log('Got Info from Storage', key, info);
            let result = await JSON.parse(info);
            return result;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

export async function saveToStorage(key, info) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(info));
        console.log("Saved Info:", key, info);
    } catch(error) {
        //console.log("Saving Info Failed: ", error.message);
    }
}

export async function loadAppData() {
    try {
        var setting = await getFromStorage(KEY_SETTINGS)
        if (setting) setSetting(setting);
        var motivationalQuotes = await getFromStorage(KEY_MOTIVATIONAL_QUOTES);
        if (motivationalQuotes) setMotivationalQuotes(motivationalQuotes);
    } catch(error) {
        //console.log("Error in Loading SettingValue: %s", error);
    }
}

export function findItemWithKeyInArray(key, val, arr) {
    for (var i=0; i<arr.length; i++) {
        if (arr[i][key] == val)
            return i;
    }
    return -1;
}
