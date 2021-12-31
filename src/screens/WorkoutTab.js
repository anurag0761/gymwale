import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
,TouchableHighlight, Platform, TextInput, Alert } from 'react-native';

import ActionButton from 'react-native-action-button';
import { withNavigationFocus } from "react-navigation";
import ActionSheet from 'react-native-action-sheet';
import Share from 'react-native-share';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import Config from '../utils/Config.js';

const ACTION_ASSIGN_TO_MEMBER = "Assign to Member";
const ACTION_EDIT = "Edit";
const ACTION_DELETE = "Delete";
const ACTION_CANCEL = "Cancel";

const moreActionsIOS = [
    ACTION_ASSIGN_TO_MEMBER, 
    ACTION_EDIT,
    ACTION_DELETE,
    ACTION_CANCEL
];

const moreActions = [
    ACTION_ASSIGN_TO_MEMBER, 
    ACTION_EDIT,
    ACTION_DELETE
];

const moreActionsIOSWithoutDelete = [
    ACTION_ASSIGN_TO_MEMBER, 
    ACTION_EDIT,
    ACTION_CANCEL
];

const moreActionsWithoutDelete = [
    ACTION_ASSIGN_TO_MEMBER, 
    ACTION_EDIT
];

class WorkoutTab extends Component {

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
        if(Config.isRebrand){
            gymID=Config.gym_id
        }
        this.state = {
            gymID: gymID,
            memberID: memberID,
            userType: userType,
            isShowingSearchView: false,
            searchText: '',
            isFetchingData: true,
            isLoading: false,
            workoutList: [],
            exerciseList: [],
            selectedIndex: -1,
            isDataLoaded: false,
        };
    }

    componentDidMount() {
        //this.fetchExerciseList();
        
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            this.updateData();
        });
    }

    componentWillUnmount() {
        if(this.focusListener) {
            this.focusListener.remove();
        }
    }

    async updateData() {
        await this.updateGymInfo();
        this.fetchExerciseList();
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
        /*
        if(this.state.isFetchingData) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                </View>
            );
        }
        */

        if(this.state.isFetchingData === false && this.state.isDataLoaded === false) {
            return (
                <View style={styles.mainContainer}>
                    <TouchableOpacity 
                        onPress={()=> {
                            this.fetchExerciseList();
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
			<View style={{flex:1,}}>
                {/*<StatusBar backgroundColor="#161a1e" barStyle="light-content" />*/}
                <View style={{ height:getStatusBarHeight(true), backgroundColor:Config.PrimaryColor}}>
                    <StatusBar backgroundColor={Config.PrimaryColor} barStyle="light-content" />
                </View>
                {this.state.isShowingSearchView ? (
          <View style={[styles.headerContainer, {backgroundColor: 'white'}]}>
            <TouchableOpacity onPress={this.hideSearchBar}>
              <Image
                style={styles.backIcon}
                source={require('../../assets/images/back_arrow.png')}
              />
            </TouchableOpacity>
            <Image
              style={styles.searchIcon}
              source={require('../../assets/images/search_icon.png')}
            />
            <TextInput
              autoFocus={true}
              autoCorrect={false}
              style={styles.searchTextInput}
              onChangeText={this.onSearchTextChanged}
              value={this.state.searchText}
              placeholder={'Search Here'}
              enablesReturnKeyAutomatically
              returnKeyType={'search'}
              onSubmitEditing={this.onSearchTextChanged}
            />
          </View>
        ) : (
          <View style={styles.headerContainer}>
            <View style={styles.titleBannerContainer}>
              <Image
                style={styles.titleBanner}
                resizeMode={'cover'}
                source={require('../../assets/images/gymvale_name_logo.png')}
              />
            </View>
            <TouchableOpacity onPress={this.showSearchBar}>
              <Image
                style={styles.searchIcon}
                source={require('../../assets/images/search_icon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.shareGymVale}>
              <Image
                style={styles.shareIcon}
                source={require('../../assets/images/share_icon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.goToNotificationsScreen}>
              <Image
                style={styles.notificationIcon}
                source={require('../../assets/images/notification_icon.png')}
              />
            </TouchableOpacity>
          </View>
        )}

                <FlatList
                    style={{ width: "100%"}}
                    data={this.state.workoutList}
                    keyExtractor={(item, index) => {
                        return index+"";
                    }}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    ItemSeparatorComponent={this.renderSeparator}
                />

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
                    this.state.userType === Constants.USER_TYPE_OWNER ? (
                        <ActionButton
                            buttonColor="#3fd458"
                            onPress={this.addWorkout}
                        />
                    ) : null
                }

                
                
                {
                    this.state.isLoading || this.state.isFetchingData ? (
                        <View style={styles.activityIndicatorContainer}>
                            <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                        </View>
                    ): null
                }

            </View>
		);
    }

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
    }

    async updateGymInfo() {

        let gymID = "";
        
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

        await this.promisedSetState({
            gymID: gymID,
            isShowingSearchView: false,
            searchText: '',
            isFetchingData: true,
            isLoading: false,
            workoutList: [],
            exerciseList: [],
            selectedIndex: -1,
            isDataLoaded: false,
        });
    }

    promisedSetState = (newState) => {
        return new Promise((resolve) => {
            this.setState(newState, () => {
                resolve()
            });
        });
    }

    goToNotificationsScreen = () => {
        this.props.navigation.navigate("NotificationsScreen");
    }

    shareGymVale = () => {
        if(this.state.userType === Constants.USER_TYPE_OWNER) {
            let title = "Join Our Gym Login Now";
            let referralURL = Constants.REFERRAL_URL_PREFIX+"g"+this.state.gymID;
            let shareOptions = {
                title: title,
                message: "Join Our Gym Login Now",
                url: referralURL,
                subject: title,
                
            };

            Share.open(shareOptions)
            .then((res) => { console.log(res) })
            .catch((err) => { err && console.log(err); });
        } else {
            let title = "Have you look this fitness application ?Download Now -";
            let referralURL = Constants.REFERRAL_APP_URL_PREFIX+"m"+this.state.memberID;
            let shareOptions = {
                title: title,
                message: "Have you look this fitness application ?Download Now -",
                url: referralURL,
                subject: title,
                
            };

            Share.open(shareOptions)
            .then((res) => { console.log(res) })
            .catch((err) => { err && console.log(err); });
        }
    }

    fetchExerciseList() {
        this.setState({
            isFetchingData: true,
        });
        
        let thisInstance = this;
        fetch(Constants.API_URL_EXERCISES_LIST)
		.then((response) => response.json())
		.then((responseJson) => {
            //console.log(responseJson);
            let exercises = responseJson[Constants.KEY_EXERCISES];
            /*
            let exerciseList = {};
            for(let i = 0; i < exercises.length; i++) {
                let exerciseID = exercises[i][Constants.KEY_EXERCISE_ID];
                exerciseList[exerciseID] = exercises[i];
            }
            */
            thisInstance.setState({
                exerciseList:exercises,
            });
            thisInstance.fetchWorkoutList(thisInstance.state.searchText);
		})
		.catch((error) => {
            thisInstance.setState({
                isFetchingData: false,
            });
            console.log("Error while fetching list....");
            console.log(error);
		});
    }

    fetchWorkoutList(searchText) {
        this.setState({
            isFetchingData: true,
        });
        
        let thisInstance = this;
        let body = "";
        if(this.state.userType === Constants.USER_TYPE_OWNER) {
            body += Constants.KEY_GYM_ID+'='+this.state.gymID;
        } else {
            body += Constants.KEY_MEMBER_ID+'='+this.state.memberID;
        }
        body += "&"+Constants.KEY_S_SEARCH+"="+ searchText;

        console.log("BODY:::" + body);
        fetch(Constants.API_URL_WORKOUT_LIST, {
			method: 'post',
            body: body,
  			headers: { 
				'Content-type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			}
		  })
		.then((response) => response.json())
		.then((responseJson) => {
            //console.log(responseJson);
            let workouts = responseJson[Constants.KEY_DATA];
            console.log("Total workouts:::" + workouts.length);

            thisInstance.setState({
                workoutList: workouts,
                isFetchingData: false,
                isDataLoaded: true,
            });
		})
		.catch((error) => {
            thisInstance.setState({
                isFetchingData: false,
            });
            console.log("Error while fetching list....");
            console.log(error);
		});
    }
    
    onSearchTextChanged = (text) => {
        this.setState({
            searchText:text
        });

        this.fetchWorkoutList(text);
    };

    showSearchBar = () => {
        this.setState({
            isShowingSearchView: true,
        })
    }

    hideSearchBar = () => {
        this.setState({
            isShowingSearchView: false,
            searchText: '',
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
    
    renderItem(item, index) {
        let imageURL = Constants.IMAGE_BASE_URL + item[Constants.KEY_IMAGE];
        let name = item[Constants.KEY_PLAN_NAME];
        let gymName = item[Constants.KEY_GYM_NAME];
        let createdBy = "Created by " + (gymName ? gymName : "GymVale");
        return(
            <TouchableHighlight
                onPress={()=> {
                    this.showWorkoutDetails(index);
                }}
            >
                <View style={styles.memberInfoContainer}>
                    <Image style={styles.memberProfileImage} resizeMode={"cover"} source={{uri:imageURL}}/>
                    <View style={styles.profileInfoView}>
                        <Text style={styles.profileNameText}>{name}</Text>
                        <Text style={styles.membershipStatusText}>{createdBy}</Text>
                    </View>
                    {
                        this.state.userType === Constants.USER_TYPE_OWNER ? (
                            <TouchableOpacity
                                onPress={()=>{  
                                    this.showMoreActions(index);
                                }}
                                style={{width:20, height:30}}
                            >
                                <Image style={styles.moreIcon} source={require('../../assets/images/more.png')} resizeMode={"cover"}/>
                            </TouchableOpacity>
                        ) : null
                    }
                    
                </View>
            </TouchableHighlight>
            
        );
    }

    addWorkout = () => {
        let params = {};
        params[Constants.KEY_EXERCISES] = this.state.exerciseList;
        params[Constants.KEY_WORKOUT_ID] = '';
        params[Constants.KEY_FROM_WORKOUT] = '';
        this.props.navigation.navigate("CreateOrEditWorkout", params);
    }

    showMoreActions(index){
        this.setState({
            selectedIndex:index
        });

        let options = (Platform.OS == 'ios') ?  moreActionsIOS : moreActions;
        let cancelOrDestructiveButtonIndex = moreActionsIOS.length - 1;
        let workout = this.state.workoutList[index];
        if(workout[Constants.KEY_GYM_ID] === "0") {
            options = (Platform.OS == 'ios') ?  moreActionsIOSWithoutDelete : moreActionsWithoutDelete;
            cancelOrDestructiveButtonIndex = moreActionsIOSWithoutDelete.length - 1;
        }

        ActionSheet.showActionSheetWithOptions({
            title: null,
            options: options,
            cancelButtonIndex: cancelOrDestructiveButtonIndex,
            destructiveButtonIndex: cancelOrDestructiveButtonIndex,
            tintColor: '#121619'
          },
          (buttonIndex) => {
            if(buttonIndex !== undefined && buttonIndex < moreActionsWithoutDelete.length) {
                this.onMoreActionSelected(buttonIndex, index);
            }
        });
    }

    onMoreActionSelected(actionIndex, selectedItemIndex) {
        let action = moreActionsIOS[actionIndex];
        if(action === ACTION_ASSIGN_TO_MEMBER) {
            this.assignToMember(selectedItemIndex);
        } else if(action == ACTION_EDIT) {
            this.editWorkout(selectedItemIndex);
        } else if(action === ACTION_DELETE) {
            this.showDeleteConfirmationAlert(selectedItemIndex);
        }
    }

    showWorkoutDetails(selectedIndex) {
        
        let workout = this.state.workoutList[selectedIndex];
        let params = {};
        params[Constants.KEY_WORKOUT_ID] = workout[Constants.KEY_ID];
        params[Constants.KEY_EXERCISES] = this.state.exerciseList;
        this.props.navigation.navigate("WorkoutDetails", params);
    }

    assignToMember(selectedIndex) {
        let workout = this.state.workoutList[selectedIndex];
        let params = {};
        params[Constants.KEY_WORKOUT_ID] = workout[Constants.KEY_ID];
        this.props.navigation.navigate("AssignToMembersScreen", params);
    }

    editWorkout(selectedIndex) {
        let workout = this.state.workoutList[selectedIndex];
        let params = {};
        params[Constants.KEY_GYM_ID] = workout[Constants.KEY_GYM_ID];
        params[Constants.KEY_WORKOUT_ID] = workout[Constants.KEY_ID];
        params[Constants.KEY_EXERCISES] = this.state.exerciseList;
        this.props.navigation.navigate("CreateOrEditWorkout", params);
    }

    showDeleteConfirmationAlert(selectedIndex) {
        Alert.alert(
            "Delete Workout", "Do you really want to delete this workout?",
            [
              { text: 'Yes, Delete', onPress: () => this.deleteWorkout(selectedIndex) },
              { text: 'No', onPress: () => console.log("Not deleting...") },
            ],
            { cancelable: true },
        );
    }

    deleteWorkout(selectedIndex) {
        let workout = this.state.workoutList[selectedIndex];

        let thisInstance = this;
        this.setState({
            isLoading: true,
        });
        let data = new FormData();
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_WORKOUT_ID, workout[Constants.KEY_ID]);

        console.log("BODY:::");
        console.log(data);
        fetch(Constants.API_URL_DELETE_WORKOUT, {
			method: 'post',
            body: data,
  			headers: { 
                'Content-type':'multipart/form-data',
				'Accept': 'application/json',
			}
		  })
		.then((response) => {
            console.log("Response:::");
            console.log(response);
            return response.json();
        })
		.then((responseJson) => {
            console.log("Response JSON:::");
            console.log(responseJson);

            let valid = responseJson[Constants.KEY_VALID];
            if(valid) {
                
                let workoutList = thisInstance.state.workoutList;

                workoutList.splice(selectedIndex, 1);

                thisInstance.setState({
                    workoutList: workoutList,
                    isLoading: false,
                }); 
                
            } else {
                let message = responseJson[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading: false,
                });
                Utils.showAlert("Error!", message);
            }
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false
            });
            console.log("Error while deleting workout....");
            console.log(error);
            Utils.showAlert("Some error occurred. Please try again.");
		});
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
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        height:44,
        backgroundColor:Config.PrimaryColor,
        paddingHorizontal: 10,
    },
    titleBannerContainer: {
        flexGrow:1,
        alignItems:'flex-start',
        justifyContent:'center',
    },
    titleBanner: {
        width:150,
        height:21.5,
    },
    backIcon: {
        width:9,
        height:16,
        resizeMode:'cover',
        marginRight:10,
    },
    searchTextInput: {
        flexGrow:1, 
        textAlign:'left', 
        color:'#41464c',
    },
    searchIcon: {
        width:13,
        height:14,
        resizeMode:'cover',
        marginRight:20,
    },
    shareIcon: {
        width:13,
        height:14,
        resizeMode:'cover',
        marginRight:20,
    },
    notificationIcon: {
        width:13,
        height:15,
        resizeMode:'cover',
        marginRight:20,
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
    memberInfoContainer: {
        padding:10,
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
    },
    memberProfileImage: {
        width:45,
        aspectRatio:1,
        borderRadius:22.5,
    },
    profileInfoView: {
        justifyContent:'center',
        alignItems:'flex-start',
        flexGrow:1,
        paddingHorizontal:10,
    },
    profileNameText: {
        color:'#343434',
        fontSize:20,
        fontWeight:'bold',
        width:'100%',
        textAlign:'left',
    },
    membershipStatusText: {
        color:'#343434',
        fontSize:16,
        width:'100%',
        textAlign:'left',
    },
    moreIcon: {
        width:5,
        height:22.5,
    },
});

export default withNavigationFocus(WorkoutTab);
