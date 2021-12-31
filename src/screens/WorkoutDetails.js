import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
     ,TouchableHighlight, Platform, TextInput } from 'react-native';

import ActionButton from 'react-native-action-button';
import ActionSheet from 'react-native-action-sheet';
import Share from 'react-native-share';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import Config from '../utils/Config';

class WorkoutDetails extends Component {

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
            memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, "");
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            let memberData = userInfo[Constants.KEY_MEMBER_DATA];
            memberData = memberData[0];
            memberID = memberData[Constants.KEY_MEMBER_ID];
            gymID = memberData[Constants.KEY_GYM_ID];
        }

        
        let workoutID = properties.navigation.getParam(Constants.KEY_WORKOUT_ID);
        let exercises = properties.navigation.getParam(Constants.KEY_EXERCISES);
        let exerciseList = {};
        for(let i = 0; i < exercises.length; i++) {
            let exerciseID = exercises[i][Constants.KEY_EXERCISE_ID];
            exerciseList[exerciseID] = exercises[i];
        }
        if(Config.isRebrand){
            gymID=Config.gym_id
        }
        this.state = {
            gymID: gymID,
            memberID: memberID,
            userType: userType,
            workoutID: workoutID,
            isLoading: false,
            exerciseList: exerciseList,
            workoutDetails: null,
            workoutDays: [],
            isDataLoaded: false,
        };
    }

    componentDidMount() {
        this.fetchWorkoutDetails();
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

        if(this.state.isLoading) {
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
                            this.fetchWorkoutDetails();
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
			<View style={{flex:1}}>
                <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                    <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                </View>

                <View style={[styles.headerContainer, {height:40,}]}>
                    <View style={styles.titleBannerContainer}>
                        <Image style={styles.titleBanner} resizeMode={"cover"} source={require('../../assets/images/gymvale_name_logo.png')} />
                    </View>
                    <TouchableOpacity onPress={this.shareGymVale}>
                        <Image style={styles.shareIcon} source={require('../../assets/images/share_icon.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.goToNotificationsScreen}>
                        <Image style={styles.notificationIcon} source={require('../../assets/images/notification_icon.png')}/>
                    </TouchableOpacity>

                </View>
                <View style={[styles.headerContainer, {backgroundColor:'white', padding:10}]}>
                    <TouchableOpacity
                        onPress={this.goBack}
                    >
                        <Image style={styles.backIcon} source={require('../../assets/images/back_arrow.png')}/>
                    </TouchableOpacity>
                    <Image style={styles.memberProfileImage} resizeMode={"cover"} source={{uri:this.state.workoutDetails[Constants.KEY_IMAGE]}}/>
                    <Text style={styles.tabTitle}>{this.state.workoutDetails[Constants.KEY_PLAN_NAME]}</Text>
                </View>
                
                {this.renderSeparator()}

                <FlatList
                    style={{ width: "100%"}}
                    data={this.state.workoutDays}
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
                
                {/*
                    this.state.isLoading ? (
                        <View style={styles.activityIndicatorContainer}>
                            <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                        </View>
                    ): null
                    */
                }

            </View>
		);
    }

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
    }

    goBack = () => {
        this.props.navigation.pop();
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

    fetchWorkoutDetails() {
        this.setState({
            isLoading: true,
        });
        
        let thisInstance = this;
        let body = Constants.KEY_WORKOUT_ID+'='+this.state.workoutID;

        console.log("BODY:::" + body);
        fetch(Constants.API_URL_GET_WORKOUT_DETAILS, {
			method: 'post',
            body: body,
  			headers: { 
				'Content-type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			}
		  })
		.then((response) => response.json())
		.then((responseJson) => {
            console.log(responseJson);

            let valid = responseJson[Constants.KEY_VALID];
            if(valid) {
                let dataList = responseJson[Constants.KEY_DATA];
                let data = dataList[0];

                let workoutName = data[Constants.KEY_WORKOUT_NAME];
                let workoutNames = workoutName.split(",");
                
                let workoutDetails = {};
                workoutDetails[Constants.KEY_WORKOUT_ID] = data[Constants.KEY_ID];
                workoutDetails[Constants.KEY_PLAN_NAME] = data[Constants.KEY_PLAN_NAME];
                workoutDetails[Constants.KEY_IMAGE] = data[Constants.KEY_IMAGE];

                let workoutDays = [];
                for(let i = 1 ; i <= 7; i++) {
                    let dayKey = "day"+i;
                    let dayExercisesIDList = [];
                    let dayExercisesList = data[dayKey];
                    for(let j = 0; j < dayExercisesList.length; j++) {
                        let dayExercises = dayExercisesList[j];
                        //console.log("dayExercises:::");
                        //console.log(dayExercises);
                        if(dayExercises && dayExercises !== "") {
                            for(let k = 0; k < dayExercises.length; k++) {
                                if(dayExercises[k] !== "on") {
                                    dayExercisesIDList.push(dayExercises[k]);
                                }
                            }
                        } 
                    }
                    //console.log(dayKey + " exercises List:::");
                    //console.log(dayExercisesIDList);
                    let workoutDay = {};
                    workoutDay[Constants.KEY_WORKOUT_NAME] = workoutNames[i-1];
                    workoutDay[Constants.KEY_EXERCISES] = dayExercisesIDList;
                    workoutDay.isExpanded = false;
                    workoutDays.push(workoutDay);
                }

                //workoutDetails[Constants.KEY_DAYS] = workoutDays;

                thisInstance.setState({
                    isLoading: false,
                    workoutDetails: workoutDetails,
                    workoutDays: workoutDays,
                    isDataLoaded: true,
                });
            } else {
                thisInstance.setState({
                    isLoading: false,
                });
            }
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false,
            });
            console.log("Error while fetching list....");
            console.log(error);
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

    toggleWorkoutDayExpansion(selectedIndex) {
        let workoutDays = this.state.workoutDays;
        workoutDays[selectedIndex].isExpanded = ! (workoutDays[selectedIndex].isExpanded);
        this.setState({
            workoutDays: workoutDays,
        });
    }
    
    renderItem(item, index) {
        
        return(
            <TouchableHighlight
                onPress={()=> {
                    this.toggleWorkoutDayExpansion(index);
                }}
            >
                <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                    <View style={styles.memberInfoContainer}>
                        <View
                            style={{
                                width:'100%',
                                flexDirection:'row',
                                justifyContent:'center',
                                alignItems:'center',
                            }}
                        >
                            <Text style={styles.dayNameText}>{"Day " + (index+1)}</Text>
                            <Text style={styles.dayWorkoutNameText}>{item[Constants.KEY_WORKOUT_NAME]}</Text>
                            {
                                item.isExpanded?(
                                    <Image style={styles.downArrow} source={require('../../assets/images/down_arrow_button.png')} resizeMode={"cover"}/>
                                ):(
                                    <Image style={styles.rightArrow} source={require('../../assets/images/right_arrow.png')} resizeMode={"cover"}/>
                                )
                            }
                        </View>
                    </View>
                    {
                        item.isExpanded ? 
                            this.renderExercises(index)
                        : null
                    }
                </View>
            </TouchableHighlight>
            
        );
    }

    renderExercises(workoutDayIndex) {
        let workoutDay = this.state.workoutDays[workoutDayIndex];
        let exerciseIDs = workoutDay[Constants.KEY_EXERCISES];
        let exercisesViews = exerciseIDs.map( (exerciseID, index) => {
            return this.renderExerciseItem(exerciseID, workoutDayIndex);
        });
        if(exercisesViews.length === 0) {
            return (
                <View style={[styles.headerContainer, {backgroundColor:'white', paddingHorizontal:20, paddingVertical:5}]} key={workoutDayIndex + "_exercise_rest"}>
                    <View style={styles.exerciseInfoContainer}>
                        <Text style={styles.exerciseTitle}>Rest Day</Text>
                    </View>
                </View>
            );
        }
        return exercisesViews;
    }

    renderExerciseItem(exerciseID, workoutDayIndex) {
        
        let exercise = this.state.exerciseList[exerciseID];
        let imageURL = Constants.IMAGE_BASE_URL_EXERCISE + exercise[Constants.KEY_EXERCISE_IMAGE];
        let exerciseTitle = exercise[Constants.KEY_EXERCISE_TITLE];
        let exerciseLevel = exercise[Constants.KEY_LEVEL_TITLE];

        return (
            <TouchableHighlight
                onPress={ () => this.goToExerciseDetailScreen(exerciseID)}
        
            >
                <View style={[styles.headerContainer, {backgroundColor:'white', paddingHorizontal:20, paddingVertical:5}]} key={workoutDayIndex + "_exercise_"+exerciseID}>
                    <Image style={styles.exerciseImage} resizeMode={"cover"} source={{uri:imageURL}} />
                    <View style={styles.exerciseInfoContainer}>
                        <Text style={styles.exerciseTitle}>{exerciseTitle}</Text>
                        <Text style={styles.exerciseLevelText}>{exerciseLevel}</Text>
                    </View>
                    <Image style={styles.rightArrow} source={require('../../assets/images/right_arrow.png')} resizeMode={"cover"}/>
                </View>
            </TouchableHighlight>
        );
    }

    goToExerciseDetailScreen(exerciseID) {
        let params = {};
        params[Constants.KEY_EXERCISE_DETAIL] = this.state.exerciseList[exerciseID];
        this.props.navigation.navigate("ExerciseDetails", params);
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
        backgroundColor:'#161a1e',
        paddingHorizontal: 10,
    },
    tabTitle: {
        color:'#343434',
        fontSize:20,
        fontWeight:'bold',
        flexGrow:1,
        textAlign:'left',
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
        width:11,
        height:20,
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
        padding:20,
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
    },
    memberProfileImage: {
        width:45,
        aspectRatio:1,
        borderRadius:22.5,
        marginHorizontal: 20,
    },
    profileInfoView: {
        justifyContent:'center',
        alignItems:'flex-start',
        flexGrow:1,
        paddingHorizontal:10,
    },
    dayNameText: {
        color:'#343434',
        fontSize:20,
        fontWeight:'bold',
        textAlign:'left',
        marginRight:10,
    },
    dayWorkoutNameText: {
        color:'#343434',
        fontSize:18,
        textAlign:'left',
        marginRight:10,
        flexGrow:1,
    },
    rightArrow: {
        width: 11,
        height: 20,
        resizeMode: 'cover',
    },
    downArrow: {
        width: 20,
        height: 11,
        resizeMode: 'cover',
    },
    moreIcon: {
        width:5,
        height:22.5,
    },
    exerciseImage: {
        width: 80,
        height: 45,
        resizeMode:'cover',
    },
    exerciseInfoContainer: {
        flex:1,
        justifyContent:'flex-start',
        alignItems:'flex-start',
        marginHorizontal:10,
    },
    exerciseTitle: {
        fontSize:16,
        color:'#343434',
        textAlign:'left',
        flex: 1, 
        flexWrap: 'wrap',
    },
    exerciseLevelText: {
        fontSize:14,
        color:'grey',
        textAlign:'left',
        flex: 1, 
        flexWrap: 'wrap',
    },
});

export default WorkoutDetails;
