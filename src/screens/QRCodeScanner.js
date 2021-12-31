import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';

import {withNavigationFocus} from 'react-navigation';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import QRScanner from 'react-native-qrcode-scanner';
import {urlAddGym} from '../Redux/Actions/urlAddGymAction';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

class QRCodeScanner extends Component {
  constructor(properties) {
    super(properties);

    let gymID = '';
    let memberID = '';

    let userInfo = globals.getSetting().userInfo;
    let body = userInfo[Constants.KEY_USER_DATA];
    let userType = body[Constants.KEY_USER_TYPE];
    if (userType === Constants.USER_TYPE_OWNER) {
      let gymData = userInfo[Constants.KEY_GYM_DATA];
      gymID = gymData[Constants.KEY_ID];
      memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, '');
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      let memberData = userInfo[Constants.KEY_MEMBER_DATA];
      memberData = memberData[0];
      memberID = memberData[Constants.KEY_MEMBER_ID];
      gymID = memberData[Constants.KEY_GYM_ID];
    }

    this.state = {
      gymID: gymID,
      cameraMode: 'back',
      memberID: memberID,
      userType: userType,
      isLoading: false,
      memberName: '',
      memberProfileImageURL: '',
      willShowAttendanceAlert: false,
      alertMessage: '',
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      //this.scanner.reactivate();
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  cameraHandler = () => {
    if (this.state.cameraMode === 'front') {
      this.setState({
        cameraMode: 'back',
      });
    } else {
      this.setState({
        cameraMode: 'front',
      });
    }
  };

  render() {
    let bottomText = '';
    let canUsePaidFeatures = globals.getSetting().canUsePaidFeatures;
    if (canUsePaidFeatures === 'true') {
      bottomText =
        'Your Prime Membership is expired on ' +
        globals.getSetting().membershipExpireDate +
        '.';
    } else {
      bottomText =
        'Current member ' +
        globals.getSetting().member +
        '/' +
        globals.getSetting().totalAddOn +
        '. Upgrade your plan now.';
    }

    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View
            style={{
              height: getStatusBarHeight(true),
              backgroundColor: '#161a1e',
            }}>
            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
          </View>
          <View style={{flex: 1, backgroundColor: 'white'}}>
            <View style={styles.headerContainer}>
              {this.state.userType === Constants.USER_TYPE_OWNER ? (
                <TouchableOpacity onPress={this.goBack}>
                  <Image
                    style={styles.backIcon}
                    source={require('../../assets/images/back_icon_white.png')}
                  />
                </TouchableOpacity>
              ) : null}

              <Text style={[styles.tabTitle, {color: 'white'}]}>
                QR Scanner
              </Text>
            </View>
            <Text style={styles.titleText}>
              Scan QR-Code for Join Or Attandance
            </Text>
            <Text style={styles.mediumText}>
              Place the QR code inside the area
            </Text>
            <Text style={styles.smallText}>
              Scanning will start automatically
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.cameraHandler();
              }}
              style={{marginLeft: 20, marginTop: 20}}>
              <Text>flip Camera</Text>
            </TouchableOpacity>
            <View style={{flex: 1, marginTop: 30}}>
              {this.props.isFocused ? (
                <QRScanner
                  cameraType={this.state.cameraMode}
                  onRead={this.onSuccess}
                  showMarker={true}
                  topContent={null}
                  bottomContent={null}
                  ref={(node) => {
                    this.scanner = node;
                  }}
                />
              ) : null}
            </View>
          </View>
          {this.state.userType === Constants.USER_TYPE_OWNER ? (
            <TouchableOpacity
              style={{width: '100%', padding: 0}}
              onPress={this.goToMembershipPlansScreen}>
              <View
                style={{
                  width: '100%',
                  height: 20,
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 0,
                  margin: 0,
                }}>
                <Text
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'white',
                    textTransform: 'uppercase',
                  }}>
                  {bottomText}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {this.state.isLoading ? (
            <View style={styles.activityIndicatorContainer}>
              <ActivityIndicator
                size="large"
                color="#161a1e"
                style={{marginTop: 35}}
              />
            </View>
          ) : null}
          {this.state.willShowAttendanceAlert ? (
            <View
              style={[
                styles.activityIndicatorContainer,
                {paddingHorizontal: 20},
              ]}>
              <View
                style={{
                  width: '100%',
                  height: 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 8,
                }}>
                <Image
                  style={{
                    width: 50,
                    aspectRatio: 1,
                    borderRadius: 25,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                  source={{uri: this.state.memberProfileImageURL}}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 10,
                  }}>
                  {this.state.memberName}
                </Text>
                <Text style={{color: 'black', fontSize: 15, marginBottom: 10}}>
                  {this.state.alertMessage}
                </Text>
                <TouchableOpacity onPress={this.hideAttendanceSavedAlert}>
                  <View
                    style={{
                      width: 100,
                      height: 30,
                      backgroundColor: '#2c9fc9',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: 'white', fontSize: 15}}>OK</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };

  onSuccess = (e) => {
    console.log('qrcode scanned:::');
    console.log(e);
    let scannedData = e.data;
    if (scannedData && scannedData.length > 0) {
      let parts = scannedData.split('?');
      let qrCodeData = parts[parts.length - 1];
      this.saveData(qrCodeData);
      //this.showDataSavedAlertWithNameAndImage("Anwar Khan", "https://gymvale.com/api/assets/uploads/images/medium/pic1570951920.jpg");
    }
  };

  saveData(qrCodeData) {
    console.log('QRCode Data::::' + qrCodeData);

    this.setState({
      isLoading: true,
    });
    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_QRCODE, qrCodeData);
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      data.append(Constants.KEY_LOGGED_IN_ID, this.state.gymID);
    } else {
      data.append(Constants.KEY_LOGGED_IN_ID, this.state.memberID);
    }

    console.log('BODY:::');
    console.log(data);

    dispatchAddGym(data);
    setTimeout(() => {
      console.log('````````````````````````````````````');
      console.log(this.props.scannerdata);
      console.log('````````````````````````````````````');

      if (this.props.scannerdata.success) {
        let valid = this.props.scannerdata.data[Constants.KEY_VALID];
        if (valid) {
          thisInstance.setState({
            isLoading: false,
          });
          let attendanceList =
            this.props.scannerdata.data[Constants.KEY_ATTENDANCE];
          if (this.props.scannerdata.data[Constants.KEY_MEMBER_DATA]) {
            attendanceList =
              this.props.scannerdata.data[Constants.KEY_MEMBER_DATA];
          }
          let firstData = attendanceList[0];
          let name = firstData[Constants.KEY_NAME];
          let imageURL = firstData[Constants.KEY_IMAGE];
          let message = this.props.scannerdata.data[Constants.KEY_MESSAGE];
          thisInstance.showDataSavedAlertWithNameAndImage(
            name,
            imageURL,
            message,
          );
        }
      } else {
        let message = 'Some error occurred. Please try agian.';
        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    }, 2000);
  }

  showDataSavedAlert() {
    let thisInstance = this;
    Alert.alert(
      'Success',
      'Data Saved successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            thisInstance.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  }

  showDataSavedAlertWithNameAndImage(name, imageURL, message) {
    this.setState({
      memberName: name,
      memberProfileImageURL: imageURL,
      alertMessage: message,
      willShowAttendanceAlert: true,
    });
  }

  hideAttendanceSavedAlert = () => {
    this.setState({
      willShowAttendanceAlert: false,
    });
  };
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  button: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 3,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    lineHeight: 40,
    marginTop: 20,
  },
  tabTitle: {
    color: '#343434',
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1,
    textAlign: 'left',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#162029',
    paddingHorizontal: 10,
    height: 40,
  },
  backIcon: {
    width: 11,
    height: 20,
    resizeMode: 'cover',
    marginRight: 10,
  },
  activityIndicatorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99999999,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imageLoadingActivityIndicatorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  titleText: {
    color: '#161616',
    width: '100%',
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  mediumText: {
    color: '#4d5257',
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    marginTop: 5,
  },
  smallText: {
    color: '#555657',
    fontSize: 12,
    width: '100%',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  qrCode: {
    width: 260,
    aspectRatio: 1,
    marginTop: 50,
    alignSelf: 'center',
  },
});

const mapStateToprops = (state) => {
  return {
    scannerdata: state.urlAddGymReducer,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      dispatchAddGym: urlAddGym,
    },
    dispatch,
  );
}
export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(withNavigationFocus(QRCodeScanner));
