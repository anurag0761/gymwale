import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator
, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
// import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';
// import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';



class QRCodeScreen extends Component {

    constructor(properties) {
        super(properties);

        let gymID = "";
        let gymName = "";
        let memberID = "";
        let memberName = "";
        
        let userInfo = globals.getSetting().userInfo;
        let body = userInfo[Constants.KEY_USER_DATA];
        let userType = body[Constants.KEY_USER_TYPE];
        if(userType === Constants.USER_TYPE_OWNER) {
            let gymData = userInfo[Constants.KEY_GYM_DATA];
            gymID = gymData[Constants.KEY_ID];
            let gymName = gymData[Constants.KEY_GYM_NAME];
            
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            let memberData = userInfo[Constants.KEY_MEMBER_DATA];
            memberData = memberData[0];
            memberID = memberData[Constants.KEY_MEMBER_ID];
            gymID = memberData[Constants.KEY_GYM_ID];
            memberName = memberData[Constants.KEY_NAME];
        }

        
        let userData = userInfo[Constants.KEY_USER_DATA];
        let userID = userData[Constants.KEY_ID];

        this.state = {
            gymID: gymID,
            gymName: gymName,
            userID: userID,
            memberID: memberID,
            memberName: memberName,
            userType: userType,
            isQRCodeLoaded: false,
        };
    }

    componentDidMount() {
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

        let qrCodeURL =  Constants.QRCODE_URL;
        if(this.state.userType === Constants.USER_TYPE_OWNER) {
            qrCodeURL += "?gym_id=" + this.state.gymID;
        } else {
            qrCodeURL += "?member_id=" + this.state.memberID;
        }
        console.log("Qrcode url::");
        console.log(qrCodeURL);
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                <View style={{flex:1, backgroundColor:'white'}}>
                    <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                        <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                    </View>
                    <View style={{flex:1, backgroundColor:'white'}}>
                        <View style={styles.headerContainer}>
                            <TouchableOpacity
                                onPress={this.goBack}
                            >
                                <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                            </TouchableOpacity>
                            
                            <Text style={[styles.tabTitle, {color:'white'}]}>QR Code</Text>
                        </View>
                        <Text style={styles.titleText}>{this.state.userType === Constants.USER_TYPE_OWNER ? this.state.gymName : this.state.memberName}</Text>
                        <Text style={styles.mediumText}>Place the QR code inside the area</Text>
                        <Text style={styles.smallText}>Scanning will start automatically</Text>
                        <Image
                            style={styles.qrCode}
                            resizeMode={"cover"}
                            source={{uri:qrCodeURL}}
                            onLoadStart={() => {
                                this.setState({
                                    isQRCodeLoaded: false,
                                });
                            }}

                            onLoadEnd={() => {
                                this.setState({
                                    isQRCodeLoaded: true,
                                });
                            }}
                        />
                        
                    </View>
                    {
                        this.state.userType === Constants.USER_TYPE_OWNER ? (
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
                                <View style={{height:70,justifyContent:'center',alignItems:'center'}}>
             {/* <BannerAd
unitId={'ca-app-pub-4186764082078301/5640882568'}
size={BannerAdSize.FULL_BANNER}
requestOptions={{
 requestNonPersonalizedAdsOnly: true,
}}
/> */}
</View>
                                
                            </TouchableOpacity>
                            
                        ) : null
                    }
                    
                    {
                        this.state.isQRCodeLoaded === false ? (
                            <View style={styles.imageLoadingActivityIndicatorContainer}>
                                <ActivityIndicator size="large" color="#162029"/>
                            </View>
                        ) : null
                        
                    }
                </View>
            </TouchableWithoutFeedback>
			
		);
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
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
        color:'#343434',
        fontSize:20,
        fontWeight:'bold',
        flexGrow:1,
        textAlign:'left',
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        backgroundColor:'#162029',
        paddingHorizontal: 10,
        height: 40,
    },
    backIcon: {
        width:11,
        height:20,
        resizeMode:'cover',
        marginRight:10,
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
    imageLoadingActivityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    titleText: {
        color:'#161616',
        width:'100%',
        paddingHorizontal:10,
        textAlign:'center',
        fontSize:16,
        fontWeight:'bold',
        marginTop:20,
    },
    mediumText: {
        color:'#4d5257',
        fontSize:14,
        width:'100%',
        textAlign:'center',
        marginTop:15,
    },
    smallText: {
        color:'#555657',
        fontSize:12,
        width:'100%',
        textAlign:'center',
        marginTop: 10,
    },
    qrCode: {
        width:260,
        aspectRatio:1,
        marginTop:50,
        alignSelf:'center',
    },
});

export default QRCodeScreen;
