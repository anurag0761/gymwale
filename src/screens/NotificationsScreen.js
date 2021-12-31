import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator
     , Platform, Keyboard, TouchableWithoutFeedback, FlatList, TouchableHighlight } from 'react-native';

import { getStatusBarHeight } from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import Swipeout from 'react-native-swipeout';
import moment from "moment";
import { deleteNotification, getallnotification } from '../Redux/Actions/GetAllNotificationAction';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class NotificationsScreen extends Component {

    constructor(properties) {
        super(properties);

        let gymID = "";
        let memberID = "";
        
        let userInfo = globals.getSetting().userInfo;
        let body = userInfo[Constants.KEY_USER_DATA];
        let userType = body[Constants.KEY_USER_TYPE];
        if(userType === Constants.USER_TYPE_OWNER) {
            let gymData = userInfo[Constants.KEY_GYM_DATA];
            gymID = gymData[Constants.KEY_ID];
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            let memberData = userInfo[Constants.KEY_MEMBER_DATA];
            memberData = memberData[0];
            memberID = memberData[Constants.KEY_MEMBER_ID];
            gymID = memberData[Constants.KEY_GYM_ID];
        }

        this.state = {
            gymID: gymID,
            memberID: memberID,
            userType: userType,
            isLoading: false,
            isFetchingData: true,
            isDataLoaded: this.props.success,
            notifications:[],
            rowID:'',
            activeRow: null,
        };
    }

    componentDidMount() {
        

        this.fetchNotifications();
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

        if(this.props.Loading) {
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
                            this.fetchNotifications();
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
                    <View style={{flex:1, backgroundColor:'#fafafa'}}>
                        <View style={styles.headerContainer}>
                            <TouchableOpacity
                                onPress={this.goBack}
                            >
                                <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                            </TouchableOpacity>
                            
                            <Text style={[styles.tabTitle, {color:'white'}]}>Notification</Text>
                        </View>
                        {
                            this.state.notifications.length > 0 ? (
                                <FlatList
                                    style={{ width: "100%"}}
                                    data={this.state.notifications}
                                    keyExtractor={(item, index) => {
                                        return index+"";
                                    }}
                                    renderItem={({ item, index }) => this.renderItem(item, index)}
                                    ItemSeparatorComponent={this.renderSeparator}
                                />
                            ) : (
                                <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                                    <Text style={{color:'black', fontSize:16, fontWeight:'bold'}}>No activity for today</Text>
                                </View>
                            )
                        }
                        
                        
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
                            </TouchableOpacity>
                        ) : null
                    }
                    {
                        this.props.Loading ? (
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

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
    }

    fetchNotifications() {
        this.setState({
            isFetchingData: true,
        });
        
        let thisInstance = this;
        let body = "";
        if(this.state.userType === Constants.USER_TYPE_OWNER) {
            body = Constants.KEY_GYM_ID+'='+this.state.gymID;
        } else {
            body = Constants.KEY_MEMBER_ID+'='+this.state.memberID;
        }
        this.props.fetchNotificationslist(body)

        // console.log("BODY:::" + body);
        // fetch(Constants.API_URL_GET_NOTIFICATIONS, {
		// 	method: 'post',
        //     body: body,
  		// 	headers: { 
		// 		'Content-type': 'application/x-www-form-urlencoded',
		// 		'Accept': 'application/json',
		// 	}
		//   })
		// .then((response) => response.json())
		// .then((responseJson) => {
        //     //console.log(responseJson);
          
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isFetchingData: false,
        //     });
        //     console.log("Error while fetching list....");
        //     console.log(error);
		// });
        let notifications = [];
        let valid = this.props.mydata[Constants.KEY_VALID];
        if(valid === true) {
            notifications = this.props.mydata[Constants.KEY_DATA];
        }
        console.log("Total notifications:::" + notifications.length);

        thisInstance.setState({
            notifications: notifications,
            isFetchingData: false,
            isDataLoaded: true,
        });
    }

    swipeBtns = [{
        text: 'Delete',
        type: 'delete',
        backgroundColor: 'red',
        onPress: () => { 
          console.log("Deleting Row with Id ", this.state.activeRow);
          this.deleteNotification(this.state.activeRow);
        }
    }];

    deleteNotification = (rowIndex) => {
        let notification = this.state.notifications[rowIndex];
        let id = notification[Constants.KEY_ID];

        this.setState({
            isLoading: true,
        });
        
        let thisInstance = this;
        let body = Constants.KEY_ID+'='+ id;

        console.log("BODY:::" + body);
this.props.deleteNotification(body);

        // fetch(Constants.API_URL_DELETE_NOTIFICATION_TEXT, {
		// 	method: 'post',
        //     body: body,
  		// 	headers: { 
		// 		'Content-type': 'application/x-www-form-urlencoded',
		// 		'Accept': 'application/json',
		// 	}
		//   })
		// .then((response) => response.json())
		// .then((responseJson) => {
        //     console.log(responseJson);
            let valid = this.props.deleteNotificationdata[Constants.KEY_VALID];
            if(valid === true) {
                let notifications = thisInstance.state.notifications;
                notifications.splice(rowIndex, 1);
                thisInstance.setState({
                    notifications: notifications,
                    isLoading: false,
                });
            } 
            // else {
        //         thisInstance.setState({
        //             isLoading: false,
        //         });
        //         Utils.showAlert("", "Some error occurred. Please try again.");
        //     }
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isLoading:false,
        //     });
        //     console.log("Error while fetching list....");
        //     console.log(error);
		// });
    };

    onSwipeOpen(rowId, direction) {
        if(typeof direction !== 'undefined'){
            this.setState({activeRow:rowId});
            console.log("Active Row",rowId);
        }
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
    
    renderItem(item, index) {
        let imageURL = Constants.IMAGE_BASE_URL + item[Constants.KEY_PROFILE_IMAGE];
        let gymName = item[Constants.KEY_GYM_NAME];
        let title = item[Constants.KEY_TITLE];
        let content = item[Constants.KEY_CONTENT];
        let createdOn = item[Constants.KEY_CREATED_DATE];//2019-11-05 03:21:12
        let notificationTimeText = moment(createdOn, "YYYY-MM-DD HH:mm:ss").fromNow();
        return(
            <Swipeout
                right={this.swipeBtns}
                close={(this.state.activeRow !== index)}
                rowID={index}
                sectionId= {1}
                autoClose = {true}
                onOpen = {(secId, rowId, direction) => this.onSwipeOpen(rowId, direction)}

            >       
                <View style={styles.notificationInfoContainer}>
                    <Image style={styles.memberProfileImage} resizeMode={"cover"} source={{uri:imageURL}}/>
                    <View style={styles.notificationInfoView}>
                        <Text style={styles.notificationTitleText}>{title}</Text>
                        <Text style={styles.notificationContentText}>{content}</Text>
                        <Text style={styles.notificationTimeText}>{notificationTimeText}</Text>
                    </View>
                </View>
            </Swipeout>
            
            
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
    notificationInfoContainer: {
        padding:10,
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white',
    },
    memberProfileImage: {
        width:45,
        aspectRatio:1,
        borderRadius:22.5,
    },
    notificationInfoView: {
        justifyContent:'center',
        alignItems:'flex-start',
        flex:1,
        paddingHorizontal:10,
    },
    notificationTitleText: {
        color:'#343434',
        fontSize:20,
        fontWeight:'bold',
        width:'100%',
        textAlign:'left',
        flex:1,
        flexWrap:'wrap',
    },
    notificationContentText: {
        color:'#343434',
        fontSize:16,
        width:'100%',
        textAlign:'left',
        flex:1,
        flexWrap:'wrap',
    },
    notificationTimeText: {
        color:'#343434',
        fontSize:14,
        width:'100%',
        textAlign:'left',
    },
});


const mapStateToProps = state => ({
    mydata:state.getallNotificationReducer.allNotification,
    // deleteNotificationdata:getallNotificationReducer.delete,
    Loading:state.getallNotificationReducer.isLoading,
    success:state.getallNotificationReducer.success,
})


function mapDispatchToProps(dispatch) {
   
    return bindActionCreators(
      {
        
        fetchNotificationslist: getallnotification,
        deleteNotification:deleteNotification
      },
      dispatch
    );
  }
export default connect(mapStateToProps, mapDispatchToProps) (NotificationsScreen);
