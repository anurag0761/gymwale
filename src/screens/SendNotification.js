import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput
, Platform, Keyboard, TouchableWithoutFeedback, FlatList, TouchableHighlight, Alert } from 'react-native';

import { getStatusBarHeight } from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { bindActionCreators } from 'redux';
import { fetchusertype } from '../Redux/Actions/UserTypeCountAction';
import { connect } from 'react-redux';
import { sendNotification } from '../Redux/Actions/SendNotifictationAction';

class SendNotification extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        this.state = {
            gymID: gymID,
            isLoading: false,
            isFetchingData: true,
            isDataLoaded: false,
            selectedMemberType: Constants.MEMBER_TYPE_ALL,
            notificationTitle:'',
            notificationMessage:'',
            registered: 0,
            expired: 0,
            upcoming: 0,
            allmember: 0,
            guest: 0,
            pendingpayment: 0,
            irregular: 0,
        };
    }

    componentDidMount() {
        // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
        // console.log(this.props.GetUserType)
        // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
        this.fetchUsertypeCounts();
    }

	render() {

        let bottomText = "";
        let canUsePaidFeatures = globals.getSetting().canUsePaidFeatures;
        if(canUsePaidFeatures === 'true') {
            bottomText = "Your Prime Membership is expired on "+ globals.getSetting().membershipExpireDate +".";
        } else {
            bottomText = "Current member "+ globals.getSetting().member + "/" +
            globals.getSetting().totalAddOn  + ". Upgrade your plan now.";
        }
        
        if(this.state.isFetchingData) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                </View>
            );
        }

        if(this.state.isDataLoaded === false) {
            return (
                <View style={styles.mainContainer}>
                    <TouchableOpacity 
                        onPress={()=> {
                            this.fetchUsertypeCounts();
                        }}
                        style={{width:'100%'}}
                    >
                        <Text
                            style={styles.button}
                        >
                        Retry to fetch data
                        </Text>
                    </TouchableOpacity>
                </View>
            );
            
        }
        

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                <View style={{flex:1}}>
                    <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                        <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                    </View>
                    <View style={{flex:1, backgroundColor:'white', paddingHorizontal: 20, paddingVertical:10}}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.tabTitle}>Send Notification</Text>
                            <TouchableOpacity
                                onPress={this.goBack}
                            >
                                <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                            </TouchableOpacity>
                            
                        </View>
                        {this.renderSeparator()}
                        <ScrollView
                            style={{width:'100%', flexGrow:1, marginTop:20}}
                        >
                            <View style={{width:'100%', justifyContent:'flex-start', alignItems:'flex-start'}}>
                                {this.renderMemberTypeOptions()}
                                <View style={styles.notificationDetailsContainer}>
                                    <Text style={styles.notificationBoxText}>Title</Text>
                                    <View style={{paddingHorizontal:20, width:'100%'}}>
                                        <TextInput 
                                            style={styles.notificationTitleInputText}
                                            placeholder={"Enter Title"}
                                            onChangeText={this.onNotificationTitleChanged}
                                            value={this.state.notificationTitle}
                                        />
                                    </View>
                                    
                                    <View style={styles.notificationMessageBox}>
                                        <Text style={styles.notificationBoxText}>Message</Text>
                                        <View style={{paddingHorizontal:20, width:'100%'}}>
                                            <TextInput 
                                                style={styles.notificationMessageInputText}
                                                placeholder={"Enter Message"}
                                                onChangeText={this.onNotificationMessageChanged}
                                                value={this.state.notificationMessage}
                                                multiline={true}
                                                numberOfLines={4}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                        <TouchableOpacity onPress={this.sendNotification} style={{marginTop: 10}}>
                            <View style={styles.blueButton}>
                                <Text style={styles.buttonText}>Send Notification</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity 
                        style={{width:'100%', padding:0,}}
                        onPress={this.goToMembershipPlansScreen}
                    >
                        <View
                            style={{
                                width:'100%',
                                height: 20,
                                backgroundColor:'red',
                                justifyContent:'center',
                                alignItems:'center',
                                padding:0,
                                margin:0,
                            }}
                        >
                            <Text style={{
                            width:'100%',
                            textAlign:'center',
                            fontSize:12,
                            color:'white',
                            textTransform:'uppercase', 
                            }}>{bottomText}</Text>
                        </View>
                    </TouchableOpacity>
                    {
                        this.state.isLoading ? (
                            <View style={styles.activityIndicatorContainer}>
                                <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                            </View>
                        ): null
                        
                    }
                </View>
            </TouchableWithoutFeedback>
			
		);
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    fetchUsertypeCounts() {
        this.setState({
            isFetchingData: true,
        });
        
        let thisInstance = this;
        let body = Constants.KEY_GYM_ID+'='+this.state.gymID;

        this.props.dispatchUserTypeCount(body)
       
        
            const  GetUserType = this.props.GetUserType;
            let valid = GetUserType[Constants.KEY_VALID];
            let registered = 0;
            let expired = 0;
            let upcoming = 0;
            let allmember = 0;
            let guest = 0;
            let pendingpayment = 0;
            let irregular = 0;
            if(valid === true) {
                registered = GetUserType[Constants.MEMBER_TYPE_REGISTERED_USER];
                expired = GetUserType[Constants.MEMBER_TYPE_EXPIRED_MEMBERSHIP];
                upcoming = GetUserType[Constants.MEMBER_TYPE_UPCOMING_EXPIRED];
                allmember = GetUserType[Constants.MEMBER_TYPE_ALL];
                guest = GetUserType[Constants.MEMBER_TYPE_GUEST];
                pendingpayment = GetUserType[Constants.MEMBER_TYPE_PENDING_PAYMENT];
                irregular = GetUserType[Constants.MEMBER_TYPE_IRREGULAER_USER];
            }
            
            thisInstance.setState({
                registered: registered,
                expired: expired,
                upcoming: upcoming,
                allmember: allmember,
                guest: guest,
                pendingpayment: pendingpayment,
                irregular: irregular,
                isFetchingData: false,
                isDataLoaded: true,
            });
		
    }

    renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "#d6d6d6",
            }}
          />
        );
    };

    renderMemberTypeOptions() {

        let memberTypes = [];
        memberTypes.push({
            title:'All Members',
            memberType: Constants.MEMBER_TYPE_ALL,
            count: this.state.allmember,
        });
        memberTypes.push({
            title:'Upcoming Expired',
            memberType: Constants.MEMBER_TYPE_UPCOMING_EXPIRED,
            count: this.state.upcoming,
        });
        memberTypes.push({
            title:'Expired Membership',
            memberType: Constants.MEMBER_TYPE_EXPIRED_MEMBERSHIP,
            count: this.state.expired,
        });
        memberTypes.push({
            title:'Guest User',
            memberType: Constants.MEMBER_TYPE_GUEST_USER,
            count: this.state.guest,
        });
        memberTypes.push({
            title:'Irregular Users',
            memberType: Constants.MEMBER_TYPE_IRREGULAER_USER,
            count: this.state.irregular,
        });
        memberTypes.push({
            title:'Registered Users',
            memberType: Constants.MEMBER_TYPE_REGISTERED_USER,
            count: this.state.registered,
        });
        memberTypes.push({
            title:'Pending Payment',
            memberType: Constants.MEMBER_TYPE_PENDING_PAYMENT,
            count: this.state.pendingpayment,
        });


        let memberTypeViews = memberTypes.map( (memberType, index) => {
            let key = "member_type_"+index;
            return(
                <TouchableOpacity onPress={()=>this.onSelectMemberType(memberType.memberType)}>
                    <View style={styles.memberTypeContainer} key={key}>
                        
                        {
                            this.state.selectedMemberType === memberType.memberType ? 
                            (
                                <View style={styles.blueBorderCircle}>
                                    <View style={styles.blueCircle} />
                                </View>
                            ) : 
                            (
                                <View style={styles.blackBorderCircle} />
                            )
                        }
                        <Text style={styles.memberTypeText}>{memberType.title} ({memberType.count})</Text>
                    </View>
                </TouchableOpacity>
                
            );
        });
        
        return memberTypeViews;
    }

    onSelectMemberType = (memberType) => {
        this.setState({
            selectedMemberType: memberType,
        });
    }

    onNotificationTitleChanged = (text) => {
        this.setState({
            notificationTitle: text,
        });
    }

    onNotificationMessageChanged = (text) => {
        this.setState({
            notificationMessage: text,
        });
    }

    sendNotification = () => {
        let title = this.state.notificationTitle;
        let message = this.state.notificationMessage;

        if(title === "") {
            Utils.showAlert("", "Please enter notification title");
            return;
        }
        if(message === "") {
            Utils.showAlert("", "Please enter notification message");
            return;
        }

        this.setState({
            isLoading: true,
        })
        let thisInstance = this;

        let data = new FormData();
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_NOTIFICATION_TYPE, this.state.selectedMemberType);
        data.append(Constants.KEY_TITLE, title);
        data.append(Constants.KEY_CONTENT, message);
        
        console.log("BODY:::");
        console.log(data);
this.props.DispatchSendNoti(data);
setTimeout(() => {
    
    if (this.props.NotiData.success) {
        let valid = this.props.NotiData[Constants.KEY_VALID];
                if(valid) {
                    thisInstance.setState({
                        isLoading:false
                    });
                    thisInstance.showNotificationSentAlert();
                }
    }
    else {
        let message = this.props.NotiData[Constants.KEY_MESSAGE];
        if(!(message && message.length > 0)) {
            message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
            isLoading:false
        });
        Utils.showAlert("Error!", message);
    }
}, 2000);
    //     fetch(Constants.API_URL_SEND_NOTIFICATION_TO_MEMBER, {
	// 		method: 'post',
    //         body: data,
  	// 		headers: { 
    //             'content-type':'multipart/form-data',
	// 			'Accept': 'application/json',
	// 		}
	// 	  })
	// 	.then((response) => {
    //         console.log("=========e======eee===e============:::");
    //         console.log(response.json());
    //         console.log("=========e======eee===e============:::");

    //         return response.json();
    //     })
	// 	.then((responseJson) => {
    //         console.log("Response JSON sendNOtification:::");
    //         console.log(responseJson);
    //         let valid = responseJson[Constants.KEY_VALID];
    //         if(valid) {
    //             thisInstance.setState({
    //                 isLoading:false
    //             });
    //             thisInstance.showNotificationSentAlert();
    //         } else {
    //             let message = responseJson[Constants.KEY_MESSAGE];
    //             if(!(message && message.length > 0)) {
    //                 message = 'Some error occurred. Please try agian.';
    //             }
    //             thisInstance.setState({
    //                 isLoading:false
    //             });
    //             Utils.showAlert("Error!", message);
    //         }
	// 	})
	// 	.catch((error) => {
    //         thisInstance.setState({
    //             isLoading: false
    //         });
    //         console.log("Error while sending notification....");
    //         console.log(error);
    //         Utils.showAlert("Some error occurred. Please try again.");
	// 	});
    }    

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
    }

    showNotificationSentAlert() {
        let thisInstance = this;
        Alert.alert(
            "Success", "Notification sent successfully.",
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

}

const styles = StyleSheet.create({
    mainContainer: {
        width:'100%',
        height:'100%',
        backgroundColor:'white',
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:15,
    },
    button: {
        borderColor:'black',
        borderWidth:2,
        borderRadius:3,
        color:'black',
        fontSize:16,
        fontWeight:'bold',
        textTransform: 'uppercase',
        width:'100%',
        textAlign:'center',
        textAlignVertical:'center',
        height:40,
        lineHeight:40,
        marginTop: 20,
    },
    tabTitle: {
        color:'#202020',
        fontSize:14,
        flexGrow:1,
        fontWeight:'bold',
        textAlign:'left',
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        backgroundColor:'white',
        height: 40,
    },
    closeIcon: {
        width:16,
        height:16,
        resizeMode:'cover',
        marginLeft:10,
    },
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        zIndex:99999999,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    blueButton: {
        backgroundColor:'#159bcc',
        borderRadius: 4,
        paddingVertical: 5,
        paddingHorizontal: 20,
        justifyContent:'center',
        alignItems:'center',
    },
    buttonText: {
        color:'white',
        fontSize:18,
        textTransform:'uppercase',
        textAlign:'center',
    },
    blueBorderCircle: {
        borderWidth:1,
        borderColor:'#2c9fc9',
        width:16,
        aspectRatio:1,
        borderRadius:8,
        justifyContent:'center',
        alignItems:'center',
    },
    memberTypeContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        paddingVertical:3,
    },
    blueCircle:{
        backgroundColor:'#2c9fc9',
        width:7,
        aspectRatio:1,
        borderRadius:3.5,
    },
    blackBorderCircle: {
        borderWidth:1,
        borderColor:'#202020',
        width:16,
        aspectRatio:1,
        borderRadius:8,
    },
    memberTypeText: {
        color:'#202020',
        fontSize:16,
        marginLeft:10,
        textAlign:'left',
    },
    notificationDetailsContainer: {
        backgroundColor:'#f7f7f7',
        width:'100%',
        paddingVertical:20,
        paddingHorizontal:10,
        marginTop: 20,
    },
    notificationBoxText: {
        fontSize:14,
        color:'#7e7e7e',
    },
    notificationMessageBox: {
        backgroundColor:'white',
        borderRadius: 10,
        padding:10, 
        marginTop: 20,
    },
    notificationTitleInputText: {
        width:'100%',
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#202020',
    },
    notificationMessageInputText: {
        width:'100%',
        borderWidth:0,
    },
});

const mapStateToprops = state => {
    return(
        {
           GetUserType:state.userTypeCountReducer.usertype,
           NotiData: state.SendNotifictationReducer,
        }
    )
}
const mapDispatchToprops = Dispatch => {
    return bindActionCreators(
        {
                dispatchUserTypeCount:fetchusertype,
                DispatchSendNoti :sendNotification
        },Dispatch
    )
}

export default connect(mapStateToprops,mapDispatchToprops)(SendNotification);
