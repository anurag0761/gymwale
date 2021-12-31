import {Alert} from 'react-native';

export const validateEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
    if (reg.test(text) === false) {
        return false;
    } else {
      return true
    }
}

export const showAlert = (title, body) => {
  Alert.alert(
    title, body,
    [
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ],
    { cancelable: true },
  );
}

const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export const guid = () => {
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

export const calculateAge = (dateOfBirth) => { // birthday is a date
  var ageDifMs = Date.now() - dateOfBirth.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}