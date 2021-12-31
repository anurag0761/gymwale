import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, Alert, ActivityIndicator, TextInput
, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, Button
, ScrollView, Switch, PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { selectContactPhone } from 'react-native-select-contact';
import RNPickerSelect from 'react-native-picker-select';
import CameraRollPicker from 'react-native-camera-roll-picker';
import DatePicker from 'react-native-datepicker'
import { withNavigationFocus } from "react-navigation";
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { RNCamera } from 'react-native-camera';
import ActionSheet from 'react-native-action-sheet';
import ImageResizer from 'react-native-image-resizer';

var RNFS = require('react-native-fs');

import DateTimePicker from '@react-native-community/datetimepicker';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addOrEditMemberAction, addOrEditMemberStaff } from '../Redux/Actions/addOrEditMember';
import { FetchSubscriptionAction } from '../Redux/Actions/FetchSubscriptionAction';
import { paymentRecieve } from '../Redux/Actions/RecievePaymentAction';
import { getMemberbyMobile } from '../Redux/Actions/GetMemberByPhoneAction';

const photoOptionsIOS = [
    "Capture with Camera", 
    "Select from Gallery",
    "Cancel"
];

const photoOptionsAndroid = [
    "Capture with Camera", 
    "Select from Gallery"
];


const PendingView = () => (
    <View
      style={{
        flex: 1,
        width:'100%',
        backgroundColor: 'lightgreen',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Waiting</Text>
    </View>
);

class AddOrEditMember extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let userData = userInfo[Constants.KEY_USER_DATA];
        let userID = userData[Constants.KEY_ID];
        let callingCode = userData[Constants.KEY_COUNTRY_ID];

        let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, "");
        let gymMemberManageID = properties.navigation.getParam(Constants.KEY_GYM_MEMBER_MANAGE_ID, "");
        let gender = properties.navigation.getParam(Constants.KEY_GENDER, "");
        let goal = properties.navigation.getParam(Constants.KEY_GOAL, "");
        let name = properties.navigation.getParam(Constants.KEY_NAME, "");
        let contactNo = properties.navigation.getParam(Constants.KEY_PHONE, "");
        let dateOfBirth = properties.navigation.getParam(Constants.KEY_DATE_OF_BIRTH, "");
        let address = properties.navigation.getParam(Constants.KEY_ADDRESS, "");
        let image = properties.navigation.getParam(Constants.KEY_IMAGE, "");
        if(image && image != "" ) {
            image = Constants.IMAGE_BASE_URL + image;
        }
        let anniversaryDate = properties.navigation.getParam(Constants.KEY_ANNIVERSARY_DATE, "");
        let registrationID = properties.navigation.getParam(Constants.KEY_REGISTRATION_ID, "");
        let membershipTypeID = "";
        let paidFee = "";
        let totalFee = "";
        let startDate = new Date().toISOString().substring(0,10);
        let endDate = "";
        let willShowNextInstallmentDate = false;
        let nextInstallmentDate = "";

        if(properties.navigation.getParam(Constants.KEY_MEMBERSHIP_TYPE_STATUS, "") === Constants.STATUS_ACTIVE) {
            membershipTypeID = properties.navigation.getParam(Constants.KEY_MEMBERSHIP_TYPE_ID, "");
            paidFee = properties.navigation.getParam(Constants.KEY_PAID_FEE, "");
            totalFee = properties.navigation.getParam(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, "");
            if(totalFee.length > 0 && paidFee.length > 0) {
                totalFee = "" + (parseInt(totalFee) - parseInt(paidFee));
            }
            startDate = properties.navigation.getParam(Constants.KEY_START_DATE, new Date().toISOString().substring(0,10));
            endDate = properties.navigation.getParam(Constants.KEY_END_DATE, "");
            if(properties.navigation.getParam(Constants.KEY_INSTALLMENT_ENABLED, "") === Constants.STATUS_ACTIVE) {
                willShowNextInstallmentDate = true;
            }
            nextInstallmentDate = properties.navigation.getParam(Constants.KEY_NEXT_INSTALLEMENT, "");
        }
        
        this.state = {
            ContactName:'',
            ContactNumber:0,
            emailId:'',
            isFetchingList: true,
            gymID: gymID,
            userID: userID,
            memberID: memberID,
            gymMemberManageID: gymMemberManageID,
            gender:gender,
            goal:goal,
            name:name,
            contactNo:contactNo,
            address:address,
            image:image,
            isShowingPhotoPicker: false,
            selectedProfileImage: '',
            temporarySelectedProfileImage:'',
            isLoading: false,
            dateOfBirth:dateOfBirth,
            anniversaryDate:anniversaryDate,
            registrationID:registrationID,
            membershipPlans: [],
            membershipPlansOptions: [],
            membershipPlansOptionsIOS: [],
            membershipPlansOptionsAndroid: [],
            selectedMembershipPlanIndex:'',
            selectedMembershipPlanID:membershipTypeID,
            membershipDuration:'',
            numberOfValidDays:'',
            totalFee:totalFee,
            startDate: startDate,
            endDate:endDate,
            isPaymentReceived: false,
            paymentReceivedAmount: '',
            willShowNextInstallmentDate:willShowNextInstallmentDate,
            nextInstallmentDate:nextInstallmentDate,
            isShowingCamera: false,
            isShowingPictureTakenWithCamera: false,
            isShowingDatePicker: false,
            datePickerType:'',
            willScrollToEnd: false,
            willShowUpgradePlanAlert: false,
            willShowInputsForMainMember: true,
            memberType:Constants.memberTypeOptionsIOS[0],
            willBeAbleToEditBasicInfo: true,
            callingCode: callingCode,
        }

    }
    contactpermission = () => {
        try {
            const granted = PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
              {
                title: "Access External Storage",
                message:
                  "Cool Photo App needs access to your camera " +
                  "so you can take awesome pictures.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              //console.log("You can use the gallery");
            } else {
              //console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    }
    
    componentDidMount() {
  
        //this.requestForPhotosPermissionIfNotGranted();
        //this.fetchMembershipPlans();
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            this.fetchMembershipPlans();
        });
    }

    requestForPhotosPermissionIfNotGranted() {
        try {
            const granted = PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: "Access External Storage",
                message:
                  "Cool Photo App needs access to your camera " +
                  "so you can take awesome pictures.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              //console.log("You can use the gallery");
            } else {
              //console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    }

    componentWillUnmount() {
        this.contactpermission();
        
        if(this.focusListener) {
            this.focusListener.remove();
        }
    }
     getPhoneNumber = () => {
       
        this.contactpermission();
       
        return selectContactPhone()
            .then(selection => {
                if (!selection) {
                    return null;
                }
                
                let { contact, selectedPhone } = selection;
                console.log(`Selected ${selectedPhone.type} phone number ${selectedPhone.number} from ${contact.name}`);
               
                this.setState({ ContactNumber: selectedPhone.number })
                this.setState({ ContactName: contact.name })
                return selectedPhone.number;
            } );
    }
  

    

    fetchMembershipPlans() {
        this.setState({
            isFetchingList: true,
        });
        let thisInstance = this;
        
        let body = Constants.KEY_GYM_ID+'='+this.state.gymID;
        this.props.getSubscription(body).then(() => {
            if(this.props.mydata.success) {
                    let membershipPlanList = this.props.mydata.subscription[Constants.KEY_BODY];
                    let membershipPlansOptions = [];
                    let membershipPlansOptionsIOS = [];
                    let membershipPlansOptionsAndroid = [];
                    let selectedMembershipPlanIndex = "";
                    for(let i = 0; i < membershipPlanList.length; i++) {
                        let plan = membershipPlanList[i];
                        let planName = plan[Constants.KEY_NAME];
                        membershipPlansOptions.push({
                            label: planName,
                            value:""+i
                        });
    
                        if(plan[Constants.KEY_ID] === thisInstance.state.selectedMembershipPlanID) {
                            selectedMembershipPlanIndex = "" + i;
                        }
    
                        membershipPlansOptionsIOS.push(planName);
                        membershipPlansOptionsAndroid.push(planName);
                    }
                    membershipPlansOptionsIOS.push("Cancel");
                    thisInstance.setState({
                        membershipPlans:membershipPlanList,
                        membershipPlansOptions: membershipPlansOptions,
                        selectedMembershipPlanIndex: selectedMembershipPlanIndex,
                        membershipPlansOptionsIOS: membershipPlansOptionsIOS,
                        membershipPlansOptionsAndroid: membershipPlansOptionsAndroid,
                        isFetchingList:false,
                    });
                    thisInstance.fetchMemberInfoWithPhoneNumber(thisInstance.state.contactNo);
                } else {
                    thisInstance.setState({
                        isFetchingList:false,
                    })
                }
        });
        
        // {
        //     setTimeout(() => {
                
        //     }, 1200);
        // }
     
            //console.log(responseJson);
           
           
			
	
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    onRegistrationIdChanged = (text) => {
        this.setState({
            registrationID: text,
        });
    }

    onNameChanged = (text) => {
        this.setState({
            name:text
        });
    }
    onEmailId = (text) => {
        this.setState({
            emailId:text
        })
    }

    onContactNoChanged = (text) => {
        this.setState({
            contactNo:text,
        });

        if(text.length > 8) {
            this.fetchMemberInfoWithPhoneNumber(text);
        }
    }

    onAddressChanged = (text) => {
        this.setState({
            address:text
        });
    }

    onGenderChanged(gender) {
        this.setState({
            gender:gender
        });
    }

    onGoalChanged(goal) {
        this.setState({
            goal:goal
        });
    }

    onBirthDateChanged = (date) => {
        this.setState({
            dateOfBirth:date
        });
    }

    onAnniversaryDateChanged = (date) => {
        this.setState({
            anniversaryDate: date
        });
    }

    onMembershipPlanChanged(planIndex) {
        if(planIndex === null) {
            this.setState({
                selectedMembershipPlanIndex:"",
                endDate: "",
                totalFee:"",
                paymentReceivedAmount:"",
                selectedMembershipPlanID: "",
                membershipDuration:'',
                numberOfValidDays:'',
                nextInstallmentDate: "",
                willShowNextInstallmentDate: false,
            });
            return;
        }
        
        let membershipPlan = this.state.membershipPlans[parseInt(planIndex)];
        let membershipPlanID = membershipPlan[Constants.KEY_ID];
        let totalFee = membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
        let monthDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
        let endDateString = this.getEndDateWithMonthDuration(monthDuration, this.state.startDate);
        let paymentReceivedAmount = "";
        let nextInstallmentDate = "";
        let willShowNextInstallmentDate = false;
        if(this.state.isPaymentReceived) {
            paymentReceivedAmount = totalFee;
        }

        if(membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] === Constants.YES) {
            willShowNextInstallmentDate = true;
            let installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
            nextInstallmentDate = this.getNextInstallmentDateWithInstallmentPeriod(installmentPeriod, this.state.startDate);
        }

        this.setState({
            selectedMembershipPlanIndex:planIndex,
            endDate: endDateString,
            totalFee:totalFee,
            paymentReceivedAmount:paymentReceivedAmount,
            selectedMembershipPlanID: membershipPlanID,
            membershipDuration:'',
            numberOfValidDays:'',
            nextInstallmentDate: nextInstallmentDate,
            willShowNextInstallmentDate: willShowNextInstallmentDate,
        });
    }

    onMembershipDurationChanged(duration) {
        let endDateString = "";
        if(duration) {
            endDateString = this.getEndDateWithMonthDuration(duration, this.state.startDate);
        }
        
        this.setState({
            membershipDuration:duration,
            endDate: endDateString,
        });
    }

    onTotalFeeChanged = (text) => {
        this.setState({
            totalFee: text,
        });
    }

    onNumberOfValidDaysChanged = (text) => {
        this.setState({
            numberOfValidDays: text,
        });
    }

    onStartDateChanged = (date) => {
        let endDateString = "";
        let nextInstallmentDate = "";
        if(this.state.selectedMembershipPlanIndex !== "") {
            let membershipPlan = this.state.membershipPlans[parseInt(this.state.selectedMembershipPlanIndex)];
            let monthDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
            if(this.state.membershipDuration.length > 0) {
                monthDuration = this.state.membershipDuration;
            }
            endDateString = this.getEndDateWithMonthDuration(monthDuration, date);

            if(membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] == Constants.YES) {
                let installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
                nextInstallmentDate = this.getNextInstallmentDateWithInstallmentPeriod(installmentPeriod, date);
            }
        }

        this.setState({
            startDate: date,
            endDate: endDateString,
            nextInstallmentDate: nextInstallmentDate,
        });
        
    }

    onNextInstallmentDateChanged = (date) => {
        this.setState({
            nextInstallmentDate: date,
        });
    }

    onTogglePaymentReceived = (value) => {
        if(value === true) {
            let totatlFees = this.state.totalFee;
            this.setState({
                isPaymentReceived: value,
                paymentReceivedAmount:totatlFees,
                willScrollToEnd: true,
            });
            
        } else {
            this.setState({
                isPaymentReceived: value,
                paymentReceivedAmount:'',
            });
        }
    }

    onPaymentReceivedAmountChanged = (text) => {
        this.setState({
            paymentReceivedAmount: text,
        });
    }

    getEndDateWithMonthDuration(monthDuration, startDate) {
        let durationInMonths = parseInt(monthDuration);
        let daysToAddToEndDate = durationInMonths*30;
        let endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + daysToAddToEndDate);
        return endDate.toISOString().substring(0, 10);
    }

    getNextInstallmentDateWithInstallmentPeriod(installmentPeriod, startDate) {
        let numberOfDays = parseInt(installmentPeriod);
        let nextInstallmentDate = new Date(startDate);
        nextInstallmentDate.setDate(nextInstallmentDate.getDate() + numberOfDays);
        return nextInstallmentDate.toISOString().substring(0, 10);
    }

    selectProfilePhoto() {
        ActionSheet.showActionSheetWithOptions({
            title: 'Add Photo By',
            options: (Platform.OS == 'ios') ? photoOptionsIOS : photoOptionsAndroid,
            cancelButtonIndex: photoOptionsIOS.length-1,
            destructiveButtonIndex: photoOptionsIOS.length-1,
            tintColor: '#121619'
        },
        (buttonIndex) => {
            if(buttonIndex !== undefined && buttonIndex < photoOptionsAndroid.length) {
                this.onOptionSelected(buttonIndex);
            }
        });
    }

    onOptionSelected(index) {
        if(index === 0) {
            this.captureWithCamera();
        } else if(index === 1){
            this.selectFromGallery();
        }
    } 

    captureWithCamera() {
        /*
        this.setState({
            temporarySelectedProfileImage: '',
            isShowingCamera: true,
        })
        */
       let params = {};
       params['onPictureTaken'] = this.onPictureTaken;
       this.props.navigation.navigate("TakePicture", params);
    }

    selectFromGallery() {
        /*
        this.setState({
            isShowingPhotoPicker: true,
            temporarySelectedProfileImage: '',
        });
        */
        let params = {};
        params['onPictureSelectedFromGallery'] = this.onPictureSelectedFromGallery;
        this.props.navigation.navigate("SelectImageFromGallery", params);
    }

    onPhotoSelected = (allSelectedImages, currentSelectedImage) => {
        //console.log("All selected images:::");
        //console.log(allSelectedImages);
        console.log("Currently selected image::");
        console.log(currentSelectedImage);
        
       this.setState({
        temporarySelectedProfileImage: currentSelectedImage
       });
    }

    cancelPhotoSelection() {
        this.setState({
            isShowingPhotoPicker:false,
        });
    }

    donePhotoSelection() {
        let selectedPhoto = this.state.temporarySelectedProfileImage;

        if(selectedPhoto) {
            
            this.setState({
                isShowingPhotoPicker:false,
                selectedProfileImage: selectedPhoto.uri,
            });
        } else {
            this.setState({
                isShowingPhotoPicker:false,
            });    
        }
    }

    saveMember = async () => {
        

     

        if(this.validateInformation() === false) {
            return;
        }

        let name = this.state.ContactName;
        let contactNo = this.state.ContactNumber;
        let gender = this.state.gender;
        let address = this.state.address;
        let goal = this.state.goal;
        let imageBase64 = "";
        if(this.state.selectedProfileImage.length > 0) {
            let imageURi = this.state.selectedProfileImage;
            try {
                let response = await ImageResizer.createResizedImage(imageURi, 1000, 1000, "JPEG", 60);
                console.log("response:::");
                console.log(response);
                imageURi = response.uri;
            } catch(error) {
                console.log("Error while resizing image...");
                console.log(error);
            }
            imageBase64 = await RNFS.readFile(imageURi, 'base64').then();
            // imageBase64 = await RNFS.readFile(this.state.selectedProfileImage, 'base64').then();
        }

        this.setState({
            isLoading: true,
        })
        let thisInstance = this;

        let membershipPlan = this.state.membershipPlans[parseInt(this.state.selectedMembershipPlanIndex)];

        let data = new FormData();
        data.append(Constants.KEY_GYM_MEMBER_MANAGE_ID, this.state.gymMemberManageID);
        data.append(Constants.KEY_ID, this.state.memberID);
        data.append(Constants.KEY_HEIGHT, "");
        data.append(Constants.KEY_WEIGHT, "");
        data.append(Constants.KEY_AGE, "");
        data.append(Constants.KEY_REGISTRATION_ID, this.state.registrationID);
        data.append(Constants.KEY_MEMBER_TYPE, Constants.MEMBER_TYPE_USER);
        data.append(Constants.KEY_NAME, name);
        data.append(Constants.KEY_PHONE, contactNo);
        data.append(Constants.KEY_GENDER, gender);
        data.append(Constants.KEY_GOAL, goal);
        data.append(Constants.KEY_DATE_OF_BIRTH, this.state.dateOfBirth);
        data.append(Constants.KEY_ANNIVERSARY_DATE, this.state.anniversaryDate);
        data.append(Constants.KEY_ADDRESS, address);
        data.append(Constants.KEY_MEMBERSHIP_ID, membershipPlan[Constants.KEY_ID]);
        data.append(Constants.KEY_MEMBERSHIP_DURATION, this.state.membershipDuration);
        data.append(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, this.state.totalFee);
        data.append(Constants.KEY_MEMBER_DAYS, this.state.numberOfValidDays);
        data.append(Constants.KEY_START_DATE, this.state.startDate);
        data.append(Constants.KEY_END_DATE, this.state.endDate);
        data.append(Constants.KEY_NEXT_INSTALLEMENT, this.state.nextInstallmentDate);
        data.append(Constants.KEY_IMAGE, imageBase64);
        data.append(Constants.KEY_COUNTRY_ID, this.state.callingCode);
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_EMAIL, this.state.emailId);
        
        console.log("BODY:::");
        console.log(data);
        
        this.props.addoreditmember(data).then(() => {
            if (this.props.Success )
            {
    
                this.showMemberSavedAlert();
            }
            
                let valid = this.props.addoreditmemberdata[Constants.KEY_VALID];
                if(valid) {
                    if(thisInstance.state.isPaymentReceived) {
                        let memberDataArray = this.props.addoreditmemberdata[Constants.KEY_MEMBER_DATA];
                        let dataObject = memberDataArray[0];
                        let memberID = dataObject[Constants.KEY_MEMBER_ID];
                        let membershipID = dataObject[Constants.KEY_MEMBER_MEMBERSHIP_ID];
                        thisInstance.updatePaymentReceived(memberID, membershipID);
                    }
                } else {
                    let statusCode = "";
                    if(this.props.addoreditmemberdata[Constants.KEY_STATUS_CODE]) {
                        statusCode = "" + this.props.addoreditmemberdata[Constants.KEY_STATUS_CODE];
                    }
                    if(statusCode === (""+Constants.STATUS_CODE_NOT_PAID_USER)) {
                        thisInstance.setState({
                            willShowUpgradePlanAlert: true,
                        });
                    } else {
                        let message = this.props.addoreditmemberdata[Constants.KEY_MESSAGE];
                        if(!(message && message.length > 0)) {
                            message = 'Some error occurred. Please try agian.';
                        }
                        thisInstance.setState({
                            isLoading:false
                        });
                        Utils.showAlert("Error!", message);
                    }
                    
                }
        })
        
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isLoading: false
        //     });
        //     console.log("Error while saving member....");
        //     console.log(error);
        //     Utils.showAlert("Some error occurred. Please try again.");
		// });
       

    }

    addGuestOrStaff = async () => {
        let name = this.state.ContactName;
        if(name.length === 0) {
            Utils.showAlert("", "Please enter Name");
            return;
        }
        let email = this.state.emailId;
        if(email.length === 0) {
            Utils.showAlert("", "Please enter Email");
            return;
        }

        let contactNo = this.state.ContactNumber;
        if(contactNo.length === 0) {
            Utils.showAlert("", "Please enter Contact No");
            return;
        }

        let gender = this.state.gender;
        if(gender === null) {
            Utils.showAlert("", "Please select gender");
            return false;
        }
        if(gender.length === 0) {
            Utils.showAlert("", "Please select gender");
            return;
        }

        let address = this.state.address;
        let goal = this.state.goal;
        let imageBase64 = "";
        if(this.state.selectedProfileImage.length > 0) {
            let imageURi = this.state.selectedProfileImage;
            try {
                let response = await ImageResizer.createResizedImage(imageURi, 1000, 1000, "JPEG", 60);
                console.log("response:::");
                console.log(response);
                imageURi = response.uri;
            } catch(error) {
                console.log("Error while resizing image...");
                console.log(error);
            }
            imageBase64 = await RNFS.readFile(imageURi, 'base64').then();
            //imageBase64 = await RNFS.readFile(this.state.selectedProfileImage, 'base64').then();
        }

        this.setState({
            isLoading: true,
        })
        let thisInstance = this;


        let memberType = Constants.MEMBER_TYPE_GUEST;
        if(this.state.memberType === "Staff") {
            memberType = Constants.MEMBER_TYPE_STAFF;
        }

        let data = new FormData();
        data.append(Constants.KEY_GYM_MEMBER_MANAGE_ID, "");
        data.append(Constants.KEY_ID, this.state.memberID);
        data.append(Constants.KEY_HEIGHT, "");
        data.append(Constants.KEY_WEIGHT, "");
        data.append(Constants.KEY_AGE, "");
        data.append(Constants.KEY_REGISTRATION_ID, "");
        data.append(Constants.KEY_MEMBER_TYPE, memberType);
        data.append(Constants.KEY_NAME, name);
        data.append(Constants.KEY_PHONE, contactNo);
        data.append(Constants.KEY_GENDER, gender);
        data.append(Constants.KEY_GOAL, goal);
        data.append(Constants.KEY_DATE_OF_BIRTH, this.state.dateOfBirth);
        data.append(Constants.KEY_ANNIVERSARY_DATE, "");
        data.append(Constants.KEY_ADDRESS, address);
        data.append(Constants.KEY_MEMBERSHIP_ID, "");
        data.append(Constants.KEY_MEMBERSHIP_DURATION, "");
        data.append(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, "");
        data.append(Constants.KEY_MEMBER_DAYS, "");
        data.append(Constants.KEY_START_DATE, "");
        data.append(Constants.KEY_END_DATE, "");
        data.append(Constants.KEY_NEXT_INSTALLEMENT, "");
        data.append(Constants.KEY_IMAGE, imageBase64);
        data.append(Constants.KEY_COUNTRY_ID, this.state.callingCode);
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_EMAIL, "");
        console.log("BODY:::");
        console.log(data);
        this.props.addOrEditMemberStaff(data).then(() => {
            if (this.props.successstaff === true)
            {
    
                this.showMemberSavedAlert();
            }
            if (this.props.successstaff === false)
            {
                let message = 'Some error occurred. Please try agian.';
    
                Utils.showAlert("Error!", message);
    
            }
        })
      
        

        // addGuestOrStaff
        // fetch(Constants.API_URL_ADD_OR_EDIT_MEMBER, {
		// 	method: 'post',
        //     body: data,
  		// 	headers: { 
        //         'content-type':'multipart/form-data',
		// 		'Accept': 'application/json',
		// 	}
		//   })
		// .then((response) => {
        //     console.log("Response:::");
        //     console.log(response);
        //     return response.json();
        // })
		// .then((responseJson) => {
        //     console.log("Response JSON:::");
        //     console.log(responseJson);
        //     let valid = responseJson[Constants.KEY_VALID];
        //     if(valid) {
        //         thisInstance.setState({
        //             isLoading:false
        //         });
        //         thisInstance.showMemberSavedAlert();
        //     } else {
        //         let message = responseJson[Constants.KEY_MESSAGE];
        //         if(!(message && message.length > 0)) {
        //             message = 'Some error occurred. Please try agian.';
        //         }
        //         thisInstance.setState({
        //             isLoading:false
        //         });
        //         Utils.showAlert("Error!", message);
        //     }
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isLoading: false
        //     });
        //     console.log("Error while adding guest....");
        //     console.log(error);
        //     Utils.showAlert("Some error occurred. Please try again.");
		// });
    }

    validateInformation() {

        let name = this.state.ContactName;
        if(name.length === 0) {
            Utils.showAlert("", "Please enter Name");
            return false;
        }
        let email = this.state.emailId;
        if(email.length === 0) {
            Utils.showAlert("", "Please enter Email Id");
            return false;
        }

        let contactNo = this.state.ContactNumber;
        if(contactNo.length === 0) {
            Utils.showAlert("", "Please enter Contact No");
            return false;
        }

        let gender = this.state.gender;
        if(gender === null) {
            Utils.showAlert("", "Please select gender");
            return false;
        }
        if(gender.length === 0) {
            Utils.showAlert("", "Please select gender");
            return false;
        }

        if(this.state.selectedMembershipPlanIndex.length === 0) {
            Utils.showAlert("", "Please select membership plan");
            return false;
        }

        if(this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_SPECIAL
        || this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_UNIVERSAL
        || this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_FLEXI_FITNESS) {

            if(this.state.membershipDuration.length === 0) {
                Utils.showAlert("", "Please select membership duration");
                return false;
            }

            if(this.state.totalFee.length === 0) {
                Utils.showAlert("", "Please enter fee.");
                return false;
            }
            let totalFees = parseInt(this.state.totalFee);
            if(totalFees < 0) {
                Utils.showAlert("", "Fee can't be negative");
                return false;
            }
        }

        if(this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_UNIVERSAL
        || this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_FLEXI_FITNESS) {
            if(this.state.numberOfValidDays.length === 0) {
                Utils.showAlert("", "Please enter number of valid days.");
                return false;
            }
            let numberOfValidDays = parseInt(this.state.numberOfValidDays);
            if(numberOfValidDays < 0) {
                Utils.showAlert("", "Number of valid days can't be negative");
                return false;
            }

            let monthDuration = parseInt(this.state.membershipDuration);
            let totalDays = monthDuration*30;
            if(numberOfValidDays > totalDays) {
                Utils.showAlert("", "Number of valid days can't be greater than membership duration.");
                return false;
            }
        }

        if(this.state.isPaymentReceived) {
            let paidAmount = parseInt(this.state.paymentReceivedAmount);
            if(paidAmount < 0) {
                Utils.showAlert("", "Please enter paid amount greater than 0");
                return false;
            }
            let totalFees = parseInt(this.state.totalFee);
            if(paidAmount > totalFees) {
                Utils.showAlert("", "Paid amount can't be greater than total fee.");
                return false;
            }
        }
        
        return true;
    }

    updatePaymentReceived(memberID, membershipID) {
        
        let thisInstance = this;

        let membershipPlan = this.state.membershipPlans[parseInt(this.state.selectedMembershipPlanIndex)];

        let currentDate = new Date();
        let dateString = currentDate.toISOString().substring(0, 10);
        dateString = dateString.replace(/-/g, "");
        let data = new FormData();
        data.append(Constants.KEY_USER_ID, this.state.userID);
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_MEMBER_MEMBERSHIP_ID, membershipID);
        data.append(Constants.KEY_MEMBER_ID, memberID);
        data.append(Constants.KEY_MEMBERSHIP_ID, membershipPlan[Constants.KEY_ID]);
        data.append(Constants.KEY_MEMBERSHIP_TYPE_ID, membershipPlan[Constants.KEY_ID]);
        data.append(Constants.KEY_DATE, dateString);
        data.append(Constants.KEY_FEES, this.state.paymentReceivedAmount);
        data.append(Constants.KEY_EMAIL, "");

        console.log("Body:::");
        console.log(data);
        this.props.dispatchpayment(data)
       setTimeout(() => {
           console.log('//');
           console.log(this.props.RecievePaymentReducer.data);
        let valid = this.props.RecievePaymentReducer.data[Constants.KEY_VALID];
        if(this.props.RecievePaymentReducer.success) {
            thisInstance.setState({
                isLoading:false
            });
            thisInstance.showMemberSavedAlert();
        } else {
           
                message = 'Some error occurred. Please try agian.';
            
            thisInstance.setState({
                isLoading:false
            });
            Utils.showAlert("Error!", message);
        }
       }, 1200);
	
    }

    showMemberSavedAlert() {
        let thisInstance = this;
        Alert.alert(
            "Success", "Member saved successfully.",
            [
                { 
                    text: 'OK', 
                    onPress: () => {
                        thisInstance.goBack();
                    } 
                },
            ],
            { cancelable: false },
          );
    }

    createMembershipPlan() {
        this.props.navigation.navigate("CreateMembershipPlan");
    }
    
	render() {
        if(this.props.Loadingmember || this.props.Loadingstaff) {
            
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#121619" />
                </View>
            );
        }

        
        if(this.state.isShowingDatePicker) {
            let date = this.state.dateOfBirth;
            if(date === '') {
                date = new Date('2020-06-12T14:42:42');
            }
            return(
                <View>
                    <DateTimePicker value={date}
                        display="default"
                        onChange={this.setDate} 
                        mode={"date"}
                        is24Hour={true}
                    />
                </View>
            );
            
        }

        /*
        if(this.state.isShowingCamera) {
            return (
                <View style={styles.cameraContainer}>
                  <RNCamera
                    style={styles.cameraPreview}
                    type={RNCamera.Constants.Type.back}
                    //flashMode={RNCamera.Constants.FlashMode.on}
                    androidCameraPermissionOptions={{
                      title: 'Permission to use camera',
                      message: 'We need your permission to use your camera',
                      buttonPositive: 'Ok',
                      buttonNegative: 'Cancel',
                    }}
                  >
                    {({ camera, status, recordAudioPermissionStatus }) => {
                      if (status !== 'READY') return <PendingView />;
                      return (
                        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems:'center' }}>
                            <TouchableOpacity onPress={() => this.takePicture(camera)} style={styles.captureButton}>
                                <Text style={{ fontSize: 14 }}> SNAP </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.cancelCapture()} style={styles.cancelCaptureButton}>
                                <Text style={{ fontSize: 14 }}> Cancel </Text>
                            </TouchableOpacity>
                        </View>
                      );
                    }}
                  </RNCamera>
                </View>
              );
        }
        */

        if(this.state.isShowingPictureTakenWithCamera) {
            return (
                <View style={styles.cameraContainer}>
                    <Image 
                        style={{
                            width: '100%',
                            flex:1,
                        }}
                        resizeMode={"cover"}
                        source={{uri:this.state.temporarySelectedProfileImage.uri}}
                    />
                    
                    <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems:'center' }}>
                        <TouchableOpacity onPress={() => this.retakePicture()} style={styles.captureButton}>
                            <Text style={{ fontSize: 14 }}> Retake </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.confirmTakenPicture()} style={styles.cancelCaptureButton}>
                            <Text style={{ fontSize: 14 }}> Confirm </Text>
                        </TouchableOpacity>
                    </View>
                </View>
              );
        }

        if(this.state.isShowingPhotoPicker) {
            return (
                <View style={{ flex: 1 }}>
                    <View
                    style={
                        Platform.OS == "android" ? { paddingTop: 0 } : { paddingTop: 20 }
                    }
                    />
        
                    <View style={{
                                width:'100%', 
                                backgroundColor:'white', 
                                height:50,
                                flexDirection:'row',
                                justifyContent:'space-around',
                                alignItems:'center',
                            }
                        }>
                        <Button
                            style={{width:100, height:'100%'}}
                            color="black"
                            title="Go back"
                            onPress={() => this.cancelPhotoSelection()}
                        />
                        <Button
                            style={{width:100, height:'100%'}}
                            color="black"
                            title="Done"
                            onPress={() => this.donePhotoSelection()}
                        />
                    </View>
                        
            
                    <CameraRollPicker
                        groupTypes="All"
                        callback={this.onPhotoSelected}
                        assetType="Photos"
                        maximum={1}
                        selected={[this.state.temporarySelectedProfileImage]}
                    />
                </View>
              );
        }

        if(this.state.willShowInputsForMainMember === false) {
            return (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                        <View
                            style={
                                { 
                                    flex: 1,
                                    backgroundColor: 'white',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }
                            }
                        >
                            <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                                <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                            </View>
                            
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    onPress={this.goBack}
                                >
                                    <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                                </TouchableOpacity>
    
                                <Text style={styles.tabTitle}>Add Member</Text>
                            </View>
    
                            <ScrollView style={{width:'100%', height:'100%'}}>
                                <View style={{width:'100%', justifyContent:'center', alignItems:'center', padding:20}}>
                                    <View style={styles.profileImageContainer}>
                                        <Image style={styles.profileImage} resizeMode={"cover"} 
                                            ref={ ref => {
                                                this._profileImage = ref;
                                                }
                                            }
                                            source={{uri:this.state.selectedProfileImage.length > 0 ? this.state.selectedProfileImage :(this.state.image.length > 0 ? this.state.image : null)}}
                                        />
                                        <TouchableOpacity 
                                            style={styles.cameraButtonContainer}
                                            onPress={() => {
                                                if(this.state.willBeAbleToEditBasicInfo) {
                                                    this.selectProfilePhoto();
                                                }
                                            }}
                                        >
                                            <Image style={styles.cameraButton} source={require('../../assets/images/camera_icon.png')} />
                                        </TouchableOpacity>
                                        
                                        
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Type</Text>
                                        </View>
                                        <TouchableOpacity onPress={ () => {
                                                //if(this.state.willBeAbleToEditBasicInfo) {
                                                    this.onSelectMemberTypeButtonClicked();
                                                //}
                                            }}>
                                            <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.memberType}</Text>
                                                <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Member Name</Text>
                                            <Text style={styles.requiredTitleText}>*</Text>
                                        </View>
                                        <TextInput 
                                            style={styles.inputText}
                                            placeholder={"Enter Member Name"}
                                            onChangeText={this.onNameChanged}
                                            value={this.state.ContactName}
                                            editable={this.state.willBeAbleToEditBasicInfo}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Contact No.</Text>
                                            <Text style={styles.requiredTitleText}>*</Text>
                                        </View>
                                        <View style={styles.inputContainer}>
                                    
                                   <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Contact Number"}
                                        onChangeText={this.onContactNoChanged}
                                        value={this.state.ContactNumber}
                                        keyboardType={"phone-pad"}
                                        // editable={this.state.willBeAbleToEditBasicInfo}
                                        editable={false}
                                        
                                    >
                                    </TextInput>
                                    <Icon name={'contacts'} size={24} style={{position:'absolute',top:'45%',bottom:0,right:0}} onPress={() => {this.getPhoneNumber}}/>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Email Id</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Email Id"}
                                       value={this.state.emailId}

                                        onChangeText={this.onEmailId}
                                        editable={this.state.willBeAbleToEditBasicInfo}
                                    />
                                </View>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Gender</Text>
                                            <Text style={styles.requiredTitleText}>*</Text>
                                        </View>
                                        <TouchableOpacity onPress={ () => {
                                            if(this.state.willBeAbleToEditBasicInfo) {
                                                this.onSelectGenderButtonClicked();
                                            }
                                        }}>
                                            <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.gender === "" ? "Select Gender": this.state.gender}</Text>
                                                <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Address</Text>
                                        </View>
                                        <TextInput 
                                            style={styles.inputText}
                                            placeholder={"Enter Address"}
                                            onChangeText={this.onAddressChanged}
                                            value={this.state.address}
                                            editable={this.state.willBeAbleToEditBasicInfo}
                                        >
    
                                        </TextInput>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Goal</Text>
                                        </View>
                                        <TouchableOpacity onPress={ () => {
                                          //if(this.state.willBeAbleToEditBasicInfo) {
                                                this.onSelectGoalButtonClicked();
                                            //}
                                        }}>
                                            <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.goal === "" ? "Select Goal": this.state.goal}</Text>
                                                <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
    
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Date of Birth</Text>
                                        </View>
                                        <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                            <DatePicker
                                                style={styles.datePickerStyle}
                                                date={this.state.dateOfBirth}
                                                mode="date"
                                                placeholder="select date"
                                                format="YYYY-MM-DD"
                                                //minDate="2016-05-01"
                                                maxDate={new Date()}
                                                confirmBtnText="Confirm"
                                                cancelBtnText="Cancel"
                                                customStyles={{
                                                    dateIcon: {
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 4,
                                                        marginLeft: 0
                                                    },
                                                    dateInput: {
                                                        marginLeft: 0,
                                                        borderWidth:0,
                                                        
                                                    },
                                                    dateText: {
                                                        textAlign:'left',
                                                        color:'#1d2b36',
                                                        fontSize:16,
                                                        width:'100%',
                                                    },
                                                    placeholderText: {
                                                        textAlign:'left',
                                                        fontSize:16,
                                                        width:'100%',
                                                    }
                                                }}
                                                onDateChange={this.onBirthDateChanged}
                                                disabled={!this.state.willBeAbleToEditBasicInfo}
                                            />
                                        </View>
                                        
                                    </View>
                                    
                                </View>
                            </ScrollView>
                            <TouchableOpacity
                                style={{width:'100%'}}
                                onPress={this.addGuestOrStaff}
                            >
                                <View style={styles.saveButtonContainer}>
                                    <Text style={styles.saveButtonText}>SAVE</Text>
                                </View>
                            </TouchableOpacity>
                          
                        </View>
                </TouchableWithoutFeedback>
                
            );
        }
        
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                    <View
                        style={
                            { 
                                flex: 1,
                                backgroundColor: 'white',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }
                        }
                    >
                        <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                        </View>
                        
                        <View style={styles.headerContainer}>
                            <TouchableOpacity
                                onPress={this.goBack}
                            >
                                <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                            </TouchableOpacity>

                            <Text style={styles.tabTitle}>{this.state.memberID === "" ? "Add" : "Edit"} Member</Text>
                        </View>

                        <ScrollView 
                            style={{width:'100%', height:'100%'}}
                            contentContainerStyle={{ flexGrow: 1 }}
                            scrollEnabled={true}
                            ref={ref => (this.scrollRef = ref)}
                            onContentSizeChange={() => {
                                if(this.state.willScrollToEnd) {
                                    this.setState({
                                        willScrollToEnd: false,
                                    });
                                    this.scrollRef.scrollToEnd();
                                }
                            }}
                        >
                            <View 
                                style={{width:'100%', justifyContent:'center', alignItems:'center', padding:20}}
                                onStartShouldSetResponder={() => true}
                            >  
                                <View style={styles.profileImageContainer}>
                                    <Image style={styles.profileImage} resizeMode={"cover"} 
                                        ref={ ref => {
                                            this._profileImage = ref;
                                            }
                                        }
                                        source={{uri:this.state.selectedProfileImage.length > 0 ? this.state.selectedProfileImage :(this.state.image.length > 0 ? this.state.image : null)}}
                                    />
                                    <TouchableOpacity 
                                        style={styles.cameraButtonContainer}
                                        onPress={() => {
                                            if(this.state.willBeAbleToEditBasicInfo) {
                                                this.selectProfilePhoto();
                                            }
                                        }}
                                    >
                                        <Image style={styles.cameraButton} source={require('../../assets/images/camera_icon.png')} />
                                    </TouchableOpacity>
                                    
                                    
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Registration Id</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Registration Id"}
                                        onChangeText={this.onRegistrationIdChanged}
                                        value={this.state.registrationID}
                                    >

                                    </TextInput>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputTitleContainer}>
                                            <Text style={styles.inputTitleText}>Type</Text>
                                        </View>
                                        <TouchableOpacity onPress={ () => {
                                            //if(this.state.willBeAbleToEditBasicInfo) {
                                                this.onSelectMemberTypeButtonClicked();
                                            //}
                                        }}>
                                            <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.memberType}</Text>
                                                <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Member Name</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Member Name"}
                                       value={this.state.ContactName}

                                        onChangeText={this.onNameChanged}
                                        editable={this.state.willBeAbleToEditBasicInfo}
                                    >

                                    </TextInput>
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Contact No</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                   <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Contact Number"}
                                        onChangeText={this.onContactNoChanged}
                                        value={this.state.ContactNumber}
                                        keyboardType={"phone-pad"}
                                        // editable={this.state.willBeAbleToEditBasicInfo}
                                        editable={false}
                                        
                                    >
                                    </TextInput>
                                    <Icon name={'contacts'} size={24} style={{position:'absolute',top:'53%',bottom:0,right:0}} onPress={this.getPhoneNumber}/>
                                </View>
                                <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Email Id</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Email Id"}
                                       value={this.state.emailId}

                                        onChangeText={this.onEmailId}
                                        editable={this.state.willBeAbleToEditBasicInfo}
                                    >

                                    </TextInput>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Gender</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TouchableOpacity onPress={()=>{
                                        if(this.state.willBeAbleToEditBasicInfo) {
                                            this.onSelectGenderButtonClicked();
                                        }
                                    }}>
                                        <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                            <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.gender === "" ? "Select Gender": this.state.gender}</Text>
                                            <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                        </View>
                                    </TouchableOpacity>
                                    
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Goal</Text>
                                    </View>
                                    <TouchableOpacity onPress={()=>{
                                        //if(this.state.willBeAbleToEditBasicInfo) {
                                            this.onSelectGoalButtonClicked();
                                        //}
                                    }}>
                                        <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                            <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.goal === "" ? "Select Goal": this.state.goal}</Text>
                                            <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Date of Birth</Text>
                                    </View>
                                    
                                    <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                        <DatePicker
                                            style={styles.datePickerStyle}
                                            date={this.state.dateOfBirth}
                                            mode="date"
                                            placeholder="Select Date"
                                            format="YYYY-MM-DD"
                                            //minDate="2016-05-01"
                                            maxDate={new Date()}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: {
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 4,
                                                    marginLeft: 0
                                                },
                                                dateInput: {
                                                    marginLeft: 0,
                                                    borderWidth:0,
                                                    
                                                },
                                                dateText: {
                                                    textAlign:'left',
                                                    color:'#1d2b36',
                                                    fontSize:16,
                                                    width:'100%',
                                                },
                                                placeholderText: {
                                                    textAlign:'left',
                                                    fontSize:16,
                                                    width:'100%',
                                                }
                                            }}
                                            onDateChange={this.onBirthDateChanged}
                                            disabled={!this.state.willBeAbleToEditBasicInfo}
                                        />
                                    </View>
                                    
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Anniversary Date</Text>
                                    </View>
                                    <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                        <DatePicker
                                            style={styles.datePickerStyle}
                                            date={this.state.anniversaryDate}
                                            mode="date"
                                            placeholder="select date"
                                            format="YYYY-MM-DD"
                                            //minDate="2016-05-01"
                                            maxDate={new Date()}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: {
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 4,
                                                    marginLeft: 0
                                                },
                                                dateInput: {
                                                    marginLeft: 0,
                                                    borderWidth:0,
                                                    
                                                },
                                                dateText: {
                                                    textAlign:'left',
                                                    color:'#1d2b36',
                                                    fontSize:16,
                                                    width:'100%',
                                                },
                                                placeholderText: {
                                                    textAlign:'left',
                                                    fontSize:16,
                                                    width:'100%',
                                                }
                                            }}
                                            onDateChange={this.onAnniversaryDateChanged}
                                            disabled={!this.state.willBeAbleToEditBasicInfo}
                                        />
                                    </View>
                                    
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Address</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter Address"}
                                        onChangeText={this.onAddressChanged}
                                        value={this.state.address}
                                        editable={this.state.willBeAbleToEditBasicInfo}
                                    >

                                    </TextInput>
                                </View>
                                
                                <View style={[styles.inputTitleContainer, {marginTop: 35,}]}>
                                    <Text style={styles.inputTitleText}>Select Membership</Text>
                                    <Text style={[styles.inputTitleText], {color:'#0b0a0a'}}> OR </Text>
                                    <TouchableOpacity
                                        onPress={()=>{this.createMembershipPlan();}}
                                    >
                                        <Text style={[styles.inputTitleText], {color:'#2c9fc9', textDecorationLine:'underline', textDecorationColor:'#2c9fc9'}}>Create Membership</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <TouchableOpacity onPress={this.onSelectMembershipPlanButtonClicked} style={{marginTop: 10,}}>
                                    <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                        <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.selectedMembershipPlanIndex === "" ? "Select Membership Plan": this.state.membershipPlansOptionsIOS[parseInt(this.state.selectedMembershipPlanIndex)]}</Text>
                                        <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                    </View>
                                </TouchableOpacity>
                                {/*
                                <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                    <RNPickerSelect
                                        onValueChange={(value) => {
                                            this.onMembershipPlanChanged(value);
                                        }}
                                        items={this.state.membershipPlansOptions}
                                        value={this.state.selectedMembershipPlanIndex}
                                        style={pickerSelectStyles}
                                        useNativeAndroidPickerStyle={false}
                                        placeholder={{
                                            label: 'Select Membership Plan',
                                            value: null,
                                            color: '#1d2b36',
                                        }}
                                        placeholderTextColor={"#1d2b36"}
                                    />
                                </View>
                                */}
                                {
                                    this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_SPECIAL
                                    || this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_UNIVERSAL
                                    || this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_FLEXI_FITNESS ? 
                                    (
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Time Duration</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TouchableOpacity onPress={this.onSelectMembershipDurationButtonClicked}>
                                                <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                    <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.membershipDuration === "" ? "Select Membership Duration": (this.state.membershipDuration === "1" ? "1 Month": this.state.membershipDuration + ' Months')}</Text>
                                                    <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                                </View>
                                            </TouchableOpacity>
                                            {/*
                                            <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                                <RNPickerSelect
                                                    onValueChange={(value) => {
                                                        this.onMembershipDurationChanged(value);
                                                    }}
                                                    items={membershipDurations}
                                                    value={this.state.membershipDuration}
                                                    style={pickerSelectStyles}
                                                    useNativeAndroidPickerStyle={false}
                                                    placeholder={{
                                                        label: 'Select Duration',
                                                        value: null,
                                                        color: '#1d2b36',
                                                    }}
                                                    placeholderTextColor={"#1d2b36"}
                                                />
                                            </View>
                                            */}
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Fees</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                placeholder={"Enter Fee"}
                                                onChangeText={this.onTotalFeeChanged}
                                                value={this.state.totalFee}
                                                keyboardType={"number-pad"}
                                            />
                                        </View>
                                    ) : null
                                }
                                {
                                    this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_UNIVERSAL
                                    || this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_FLEXI_FITNESS
                                    ? 
                                    (
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Valid for number of days</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                placeholder={"Enter number of days"}
                                                onChangeText={this.onNumberOfValidDaysChanged}
                                                value={this.state.numberOfValidDays}
                                                keyboardType={"number-pad"}
                                            />
                                        </View>
                                    ): null
                                }
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Start Date</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                    <DatePicker
                                        style={styles.datePickerStyle}
                                        date={this.state.startDate}
                                        mode="date"
                                        placeholder="select start date"
                                        format="YYYY-MM-DD"
                                        //minDate={new Date()}
                                        //maxDate={new Date()}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: {
                                                position: 'absolute',
                                                right: 0,
                                                top: 4,
                                                marginLeft: 0
                                            },
                                            dateInput: {
                                                marginLeft: 0,
                                                borderWidth:0,
                                                
                                            },
                                            dateText: {
                                                textAlign:'left',
                                                color:'#1d2b36',
                                                fontSize:16,
                                                width:'100%',
                                            },
                                            placeholderText: {
                                                textAlign:'left',
                                                fontSize:16,
                                                width:'100%',
                                            }
                                        }}
                                        onDateChange={this.onStartDateChanged}
                                    />
                                </View>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>End Date</Text>
                                </View>
                                <TextInput 
                                    style={styles.inputText}
                                    value={this.state.endDate}
                                    editable={false}
                                />
                                {
                                    this.state.willShowNextInstallmentDate ? (
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Next Installment</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                                <DatePicker
                                                    style={styles.datePickerStyle}
                                                    date={this.state.nextInstallmentDate}
                                                    mode="date"
                                                    placeholder="select Next Installment date"
                                                    format="YYYY-MM-DD"
                                                    //minDate={new Date()}
                                                    //maxDate={new Date()}
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    customStyles={{
                                                        dateIcon: {
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: 4,
                                                            marginLeft: 0
                                                        },
                                                        dateInput: {
                                                            marginLeft: 0,
                                                            borderWidth:0,
                                                            
                                                        },
                                                        dateText: {
                                                            textAlign:'left',
                                                            color:'#1d2b36',
                                                            fontSize:16,
                                                            width:'100%',
                                                        },
                                                        placeholderText: {
                                                            textAlign:'left',
                                                            fontSize:16,
                                                            width:'100%',
                                                        }
                                                    }}
                                                    onDateChange={this.onNextInstallmentDateChanged}
                                                />
                                            </View>
                                        </View>
                                    ) : 
                                    null
                                }
                                {
                                    this.state.isPaymentReceived ? (
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Paid Amount</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                placeholder={"Enter Paid Amount"}
                                                onChangeText={this.onPaymentReceivedAmountChanged}
                                                value={this.state.paymentReceivedAmount}
                                                keyboardType={"number-pad"}
                                            />
                                        </View>
                                    ) : null
                                }
                                <View style={styles.inputTitleContainer}>
                                    <Text style={[styles.inputTitleText], {color:'#1d2b36'}}>Total Fees: {this.state.totalFee}</Text>
                                    <Text style={[styles.inputTitleText, {flexGrow:1, color:'#1d2b36', textAlign:'right'}]}>Payment Received</Text>
                                    <Switch
                                        onValueChange={this.onTogglePaymentReceived}
                                        value={this.state.isPaymentReceived}
                                        trackColor={"#162029"}
                                    />
                                </View>
                                

                                
                                
                            </View>
                        </ScrollView>
                        <TouchableOpacity
                            style={{width:'100%'}}
                            onPress={this.saveMember}
                        >
                            <View style={styles.saveButtonContainer}>
                                <Text style={styles.saveButtonText}>SAVE</Text>
                            </View>
                        </TouchableOpacity>
                        
                        
                        {
                            this.state.willShowUpgradePlanAlert ? (
                                <View style={[styles.activityIndicatorContainer, {paddingHorizontal:40}]}>
                                    <View style={{
                                        width:'100%',
                                        height:240,
                                        justifyContent:'center',
                                        alignItems:'center',
                                        backgroundColor:'white',
                                        borderTopEndRadius:4,
                                    }}>
                                        <View style={{width:'100%',justifyContent:'center', alignItems:'flex-end', padding:10}}>
                                            <TouchableOpacity
                                                onPress={()=>{
                                                    this.setState({
                                                        willShowUpgradePlanAlert:false,
                                                    });
                                                }}
                                            >
                                                <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{textAlign:'center', width:'100%', fontSize:15, color:'#202020'}}>Upgrade Your Plan</Text>
                                        <Text style={{padding:30, textAlign:'center', width:'100%', flexWrap:'wrap', fontSize:18, fontWeight:'500', color:'#202020'}}>Get A Prime Membership For Edit or Delete this member</Text>
                                        <View style={{paddingHorizontal:30, width:'100%'}}>
                                            <TouchableOpacity style={{width:'100%'}} onPress={()=> {
                                                this.setState({
                                                    willShowUpgradePlanAlert: false,
                                                });
                                                this.goToMembershipPlansScreen();
                                            }}>
                                                <View style={{ backgroundColor:'#159bcc', width:'100%', height:30, borderRadius:2.5, justifyContent:'center', alignItems:'center'}}>
                                                    <Text style={{
                                                        fontSize:14, 
                                                        fontWeight:'500', 
                                                        color:'white',
                                                        width:'100%',
                                                        textAlign:'center',
                                                        textTransform:'uppercase'}}
                                                    >Go Prime</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        
                                    </View>
                                </View>
                            ): null
                        }
                    </View>
            </TouchableWithoutFeedback>
			
		);
    }

    showDatePickerWithType(datePickerType) {
        this.setState({
            datePickerType: datePickerType,
            isShowingDatePicker: true,
        });
    }

    setDate = (event, date) => {
        console.log("On setDate Event::::");
        console.log(event);
        console.log(date);
    }

    takePicture = async (camera) => {
        const options = { quality: 0.8, base64: true, fixOrientation: true };
        const data = await camera.takePictureAsync(options);
        //  eslint-disable-next-line
        console.log("Picture taken:::");
        console.log(data.uri);

        this.setState({
            temporarySelectedProfileImage: data,
            isShowingCamera: false,
            isShowingPictureTakenWithCamera: true,
        })
    };

    cancelCapture = () => {
        this.setState({
            isShowingCamera: false,
        });
    }

    retakePicture = () => {
        this.setState({
            isShowingPictureTakenWithCamera: false,
        });
        this.captureWithCamera();
    }

    confirmTakenPicture = () => {
        let selectedPhoto = this.state.temporarySelectedProfileImage;

        if(selectedPhoto) {
            
            this.setState({
                isShowingPictureTakenWithCamera: false,
                selectedProfileImage: selectedPhoto.uri,
            });
        } else {
            this.setState({
                isShowingPictureTakenWithCamera: false,
            });    
        }
    }

    onPictureTaken = (pictureUri) => {
        console.log("Picture Taken::::", pictureUri);
        this.setState({
            selectedProfileImage: pictureUri,
        });
    }

    onPictureSelectedFromGallery = (pictureUris) => {
        if(pictureUris.length > 0) {
            let pictureUri = pictureUris[0].uri;
            this.setState({
                selectedProfileImage: pictureUri,
            });
        }
        /*
        this.setState({
            selectedProfileImage: pictureUri,
        });
        */
    }

    onSelectMemberTypeButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Member Type',
            options: (Platform.OS == 'ios') ? Constants.memberTypeOptionsIOS : Constants.memberTypeOptionsAndroid,
            cancelButtonIndex: Constants.memberTypeOptionsIOS.length-1,
            destructiveButtonIndex: Constants.memberTypeOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
                console.log("selected button index:::" + buttonIndex);
                if(buttonIndex !== undefined && buttonIndex < Constants.memberTypeOptionsAndroid.length) {
                    this.onMemberTypeOptionSelected(buttonIndex);
                }
        });
    }

    onMemberTypeOptionSelected(index) {
        let memberType = Constants.memberTypeOptionsIOS[index];
        let willShowInputsForMainMember = false;
        if(index === 0) {
            willShowInputsForMainMember = true;
        }
        this.setState({
            memberType: memberType,
            willShowInputsForMainMember : willShowInputsForMainMember,
        });
    }

    onSelectGenderButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Gender',
            options: (Platform.OS == 'ios') ? Constants.genderOptionsIOS : Constants.genderOptionsAndroid,
            cancelButtonIndex: Constants.genderOptionsIOS.length-1,
            destructiveButtonIndex: Constants.genderOptionsIOS.length-1,
            tintColor: '#121619'
        },
        (buttonIndex) => {
            console.log("selected button index:::" + buttonIndex);
            if(buttonIndex !== undefined && buttonIndex < Constants.genderOptionsAndroid.length) {
                this.onGenderOptionSelected(buttonIndex);
            }
        });
    }

    onGenderOptionSelected(index) {
        let genderOption = Constants.genderOptionsIOS[index];
        let gender = Constants.genderValues[genderOption];
        this.setState({
            gender:gender
        });
    }

    onSelectGoalButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Goal',
            options: (Platform.OS == 'ios') ? Constants.goalOptionsIOS : Constants.goalOptionsAndroid,
            cancelButtonIndex: Constants.goalOptionsIOS.length-1,
            destructiveButtonIndex: Constants.goalOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < Constants.goalOptionsAndroid.length) {
                this.onGoalOptionSelected(buttonIndex);
            }
        });
    }

    onGoalOptionSelected(index) {
        let goalOption = Constants.goalOptionsIOS[index];
        let goal = Constants.goalValues[goalOption];
        this.setState({
            goal: goal,
        });
    }

    onSelectMembershipPlanButtonClicked = () => {
        let membershipPlansOptionsIOS = this.state.membershipPlansOptionsIOS;
        let membershipPlansOptionsAndroid = this.state.membershipPlansOptionsAndroid;
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Membership Plan',
            options: (Platform.OS === 'ios') ? membershipPlansOptionsIOS : membershipPlansOptionsAndroid,
            cancelButtonIndex: membershipPlansOptionsIOS.length-1,
            destructiveButtonIndex: membershipPlansOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
            if(buttonIndex !== undefined && buttonIndex < membershipPlansOptionsAndroid.length) {
                this.onMmbershipPlanOptionSelected(buttonIndex);
            }
        });
    }

    onMmbershipPlanOptionSelected(index) {
        let planIndex = ""+index;
        let membershipPlan = this.state.membershipPlans[parseInt(planIndex)];
        let membershipPlanID = membershipPlan[Constants.KEY_ID];
        let totalFee = membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
        let monthDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
        let endDateString = this.getEndDateWithMonthDuration(monthDuration, this.state.startDate);
        let paymentReceivedAmount = "";
        let nextInstallmentDate = "";
        let willShowNextInstallmentDate = false;
        if(this.state.isPaymentReceived) {
            paymentReceivedAmount = totalFee;
        }

        if(membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] === Constants.YES) {
            willShowNextInstallmentDate = true;
            let installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
            nextInstallmentDate = this.getNextInstallmentDateWithInstallmentPeriod(installmentPeriod, this.state.startDate);
        }

        this.setState({
            selectedMembershipPlanIndex:planIndex,
            endDate: endDateString,
            totalFee:totalFee,
            paymentReceivedAmount:paymentReceivedAmount,
            selectedMembershipPlanID: membershipPlanID,
            membershipDuration:'',
            numberOfValidDays:'',
            nextInstallmentDate: nextInstallmentDate,
            willShowNextInstallmentDate: willShowNextInstallmentDate,
        });
    }

    onSelectMembershipDurationButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Membership Duration',
            options: (Platform.OS == 'ios') ? Constants.membershipDurationOptionsIOS : Constants.membershipDurationOptionsAndroid,
            cancelButtonIndex: Constants.membershipDurationOptionsIOS.length-1,
            destructiveButtonIndex: Constants.membershipDurationOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < Constants.membershipDurationOptionsAndroid.length) {
                this.onMembershipDurationOptionSelected(buttonIndex);
            }
        });
    }

    onMembershipDurationOptionSelected(index) {
        let durationOption = Constants.membershipDurationOptionsIOS[index];
        let duration = Constants.membershipDurationValues[durationOption];
        
        let endDateString = this.getEndDateWithMonthDuration(duration, this.state.startDate);
        
        this.setState({
            membershipDuration:duration,
            endDate: endDateString,
        });
    }

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
    }

    fetchMemberInfoWithPhoneNumber(phoneNumber) {
        
        this.setState({
            isLoading: true,
        });

        let thisInstance = this;

        let data = new FormData();
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_MOBILE, phoneNumber);
        
        console.log("fetchMemberInfoWithPhoneNumber Body:::");
        console.log(data);
this.props.getMemberbyMobile(data).then(() => {
    let valid = this.props.GetMemberbyMobileReducer[Constants.KEY_VALID];
    if(valid) {
        let willBeAbleToEditBasicInfo = true;
        let dataObject = this.props.GetMemberbyMobileReducer[Constants.KEY_DATA];
        let phoneVerified = dataObject[Constants.KEY_PHONE_VERIFIED];
        if(phoneVerified === '1') {
            willBeAbleToEditBasicInfo = false;
        }
        let willShowInputsForMainMember = false;
        let memberID = dataObject[Constants.KEY_ID];
        if(dataObject[Constants.KEY_GYM_MEMBER_MANAGE_ID] === '') {
            memberID = "";
        }
        let memberType = dataObject[Constants.KEY_MEMBER_TYPE];
        if(memberType === "user") {
            memberType = "Member";
            willShowInputsForMainMember = true;
        } else if(memberType === 'guest') {
            memberType = "Guest";
        } else if(memberType === "staff") {
            memberType = "Staff";
        }

        let name = dataObject[Constants.KEY_NAME];
        let image = dataObject[Constants.KEY_IMAGE];
        let email = dataObject[Constants.KEY_EMAIL];
        let gender = dataObject[Constants.KEY_GENDER];
        let goal = dataObject[Constants.KEY_GOAL];
        let dateOfBirth = dataObject[Constants.KEY_DATE_OF_BIRTH];
        let address = dataObject[Constants.KEY_ADDRESS];
        let anniversaryDate = dataObject[Constants.KEY_ANNIVERSARY_DATE];

        thisInstance.setState({
           willBeAbleToEditBasicInfo: willBeAbleToEditBasicInfo,
           memberID: memberID,
           willShowInputsForMainMember: willShowInputsForMainMember,
           memberType: memberType,
           name: name,
           image: image,
           email: email,
           gender: gender,
           goal: goal,
           dateOfBirth: dateOfBirth,
           address: address,
           anniversaryDate: anniversaryDate,
           isLoading: false,
        });
    } else {
        
        thisInstance.setState({
            isLoading:false,
        });
    }
})
        // fetch(Constants.API_URL_GET_MEMBER_BY_MOBILE, {
		// 	method: 'post',
        //     body: data,
  		// 	headers: { 
        //         'content-type':'multipart/form-data',
		// 		'Accept': 'application/json',
		// 	}
		//   })
		// .then((response) => {
        //     return response.json();
        // })
		// .then((responseJson) => {
        //     console.log("/////////////////////////////////////////////////////////////////////////");
        //     console.log(responseJson);
        //     console.log("/////////////////////////////////////////////////////////////////////////");
        //     let valid = responseJson[Constants.KEY_VALID];
        //     if(valid) {
        //         let willBeAbleToEditBasicInfo = true;
        //         let dataObject = responseJson[Constants.KEY_DATA];
        //         let phoneVerified = dataObject[Constants.KEY_PHONE_VERIFIED];
        //         if(phoneVerified === '1') {
        //             willBeAbleToEditBasicInfo = false;
        //         }
        //         let willShowInputsForMainMember = false;
        //         let memberID = dataObject[Constants.KEY_ID];
        //         if(dataObject[Constants.KEY_GYM_MEMBER_MANAGE_ID] === '') {
        //             memberID = "";
        //         }
        //         let memberType = dataObject[Constants.KEY_MEMBER_TYPE];
        //         if(memberType === "user") {
        //             memberType = "Member";
        //             willShowInputsForMainMember = true;
        //         } else if(memberType === 'guest') {
        //             memberType = "Guest";
        //         } else if(memberType === "staff") {
        //             memberType = "Staff";
        //         }

        //         let name = dataObject[Constants.KEY_NAME];
        //         let image = dataObject[Constants.KEY_IMAGE];
        //         let email = dataObject[Constants.KEY_EMAIL];
        //         let gender = dataObject[Constants.KEY_GENDER];
        //         let goal = dataObject[Constants.KEY_GOAL];
        //         let dateOfBirth = dataObject[Constants.KEY_DATE_OF_BIRTH];
        //         let address = dataObject[Constants.KEY_ADDRESS];
        //         let anniversaryDate = dataObject[Constants.KEY_ANNIVERSARY_DATE];

        //         thisInstance.setState({
        //            willBeAbleToEditBasicInfo: willBeAbleToEditBasicInfo,
        //            memberID: memberID,
        //            willShowInputsForMainMember: willShowInputsForMainMember,
        //            memberType: memberType,
        //            name: name,
        //            image: image,
        //            email: email,
        //            gender: gender,
        //            goal: goal,
        //            dateOfBirth: dateOfBirth,
        //            address: address,
        //            anniversaryDate: anniversaryDate,
        //            isLoading: false,
        //         });
        //     } else {
                
        //         thisInstance.setState({
        //             isLoading:false,
        //         });
        //     }
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isLoading: false,
        //     });
        //     console.log("Error while fetching member info....");
        //     console.log(error);
            
        // });
    }
}

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    cameraPreview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    captureButton: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    cancelCaptureButton: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        padding:15,
        height:40,
    },
    closeButton: {
        color:'#194164',
        textAlign:'center',
        textAlignVertical:'center',
        fontSize:16,
    },
    titleText: {
        color:'#194164',
        textAlign:'left',
        textAlignVertical:'center',
        fontSize:17,
        flexGrow:1,
        marginLeft:10,
    },
    profileImageContainer: {
        width:75,
        aspectRatio:1,
    },
    profileImage: {
        width:75,
        aspectRatio:1,
        borderRadius:37.5,
        borderWidth:StyleSheet.hairlineWidth,
        borderColor:'black',
    },
    cameraButtonContainer: {
        position:'absolute',
        top:21,
        right:-16.5,
    },
    cameraButton: {
        width:33,
        height:33,
        backgroundColor:'transparent',
    },
    inputContainer: {
        width:'100%',
        justifyContent:'flex-start',
        alignItems:'center',
    },
    inputTitleContainer:{
        marginTop:15,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
    },
    inputTitleText: {
        color:'#b5b5b5',
        fontSize:14,
    }, 
    requiredTitleText:{
        color:'#d83110',
        fontSize:16,
        fontWeight:'bold',
        marginLeft:5,
    }, 
    inputText: {
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#1d2b36',
        color:'#162029',
        fontSize:16,
        width:'100%',
    },
    saveButtonContainer: {
        marginTop:15,
        width:'100%',
        backgroundColor:'#162029',
        height:40,
        justifyContent:'center',
        alignItems:'center'
    },
    saveButtonText: {
        color:'white',
        fontSize:22,
    },
    datePickerStyle: {
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#1d2b36',
        width:'100%',
    },
    closeIcon: {
        width:16,
        height:16,
        resizeMode:'cover',
        marginRight: 10,
    },
    tabTitle: {
        color:'#202020',
        fontSize:14,
        flexGrow:1,
        fontWeight:'bold',
        textAlign:'left',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%',
        borderBottomWidth:2,
        borderColor:'#162029',
    },
    inputAndroid: {
        paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%',
        borderBottomWidth:2,
        borderColor:'#162029',
    },
  });
  const mapStateToProps = (state) => {
      return ({
          Success:state.addOrEditMember.success,
          Loadingmember:state.addOrEditMember.isLoading,
          Loadingstaff:state.addOrEditMember.isLoadingstaff,
          successstaff:state.addOrEditMember.successstaff,
          addoreditmemberdata:state.addOrEditMember.data,
           mydata:state.FetchSubscriptionReducer,
           RecievePaymentReducer:state.RecievePaymentReducer,
           GetMemberbyMobileReducer:state.GetMemberbyMobileReducer.data,
      })
  }
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        dispatchpayment:paymentRecieve,
        addoreditmember: addOrEditMemberAction,
        addOrEditMemberStaff:addOrEditMemberStaff,
        getSubscription: FetchSubscriptionAction,
        getMemberbyMobile: getMemberbyMobile
        
      },
      dispatch
    );
  }
export default connect(mapStateToProps,mapDispatchToProps)(withNavigationFocus(AddOrEditMember));
