import React, { Component } from 'react';
import { Text, Image, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
     ,TouchableHighlight, Platform, TextInput } from 'react-native';

import ActionButton from 'react-native-action-button';
import { withNavigationFocus } from "react-navigation";
import ActionSheet from 'react-native-action-sheet';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';

const ACTION_EDIT = "Edit";
const ACTION_CANCEL = "Cancel";

const moreActionsIOS = [
    ACTION_EDIT,
    ACTION_CANCEL
];

const moreActions = [
    ACTION_EDIT
];

class MemberWorkoutScreen extends Component {

    constructor(properties) {
        super(properties);

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
            gymID = memberData[Constants.KEY_GYM_ID];
        }

        let memberID = properties.memberID;
        let willStopChildFlatListScrolling = properties.willStopChildFlatListScrolling;

        this.state = {
            gymID: gymID,
            memberID: memberID,
            isShowingSearchView: false,
            isLoading: false,
            workoutList: [],
            exerciseList: [],
            selectedIndex: -1,
            isDataLoaded: false,
            searchText:"",
            willStopChildFlatListScrolling,
        };
    }

    componentDidMount() {
        this.fetchExerciseList();
        
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            this.fetchExerciseList();
        });
    }

    componentWillUnmount() {
        if(this.focusListener) {
            this.focusListener.remove();
        }
    }

	render() {

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
			<View style={{flex:1}}>
                <FlatList
                    style={{ width: "100%"}}
                    data={this.state.workoutList}
                    keyExtractor={(item, index) => {
                        return index+"";
                    }}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    ItemSeparatorComponent={this.renderSeparator}
                    scrollEnabled={!this.state.willStopChildFlatListScrolling}
                />
                
                {/*
                    this.state.isLoading ? (
                        <View style={styles.activityIndicatorContainer}>
                            <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                        </View>
                    ): null
                */}

            </View>
		);
    }

    fetchExerciseList() {
        this.setState({
            isLoading: true,
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
                isLoading: false,
            });
            console.log("Error while fetching list....");
            console.log(error);
		});
    }

    fetchWorkoutList(searchText) {
        this.setState({
            isLoading: true,
        });
        
        let thisInstance = this;
        let body = Constants.KEY_GYM_ID+'='+this.state.gymID
        + "&" + Constants.KEY_MEMBER_ID + "=" + this.state.memberID
        + "&"+Constants.KEY_S_SEARCH+"="+ searchText;

        console.log("##### fetchWorkoutList BODY:::" + body);
        console.log("##### fetchWorkoutList BODY:::" + body);
        console.log("##### fetchWorkoutList BODY:::" + body);
        console.log("##### fetchWorkoutList BODY:::" + body);
        console.log("##### fetchWorkoutList BODY:::" + body);
        // API_URL_WORKOUT_LIST
        fetch(Constants.API_URL_ASSIGN_LIST_FOR_OWNER, {
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
            let workouts = responseJson[Constants.KEY_DATA];
            if(workouts === null || workouts === undefined) {
                workouts = [];
            }
            /*
            let total = workouts.length;
            for(let i = 0; i < total; i++) {
                workouts.push(workouts[i]);
                workouts.push(workouts[i]);
            }
            */
            console.log("Total workouts:::" + workouts.length);

            thisInstance.setState({
                workoutList: workouts,
                isLoading: false,
                isDataLoaded: true,
            });
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
                    <TouchableOpacity
                        onPress={()=>{  
                            this.showMoreActions(index);
                        }}
                        style={{width:20, height:30}}
                    >
                        <Image style={styles.moreIcon} source={require('../../assets/images/more.png')} resizeMode={"cover"}/>
                    </TouchableOpacity>
                </View>
            </TouchableHighlight>
            
        );
    }

    addWorkout = () => {
        let params = {};
        params[Constants.KEY_EXERCISES] = this.state.exerciseList;
        params[Constants.KEY_MEMBER_ID] = this.state.memberID;
        this.props.navigation.navigate("CreateOrEditWorkout", params);
    }

    showMoreActions(index){
        this.setState({
            selectedIndex:index
        });
        ActionSheet.showActionSheetWithOptions({
            title: null,
            options: (Platform.OS == 'ios') ? moreActionsIOS : moreActions,
            cancelButtonIndex: moreActionsIOS.length-1,
            destructiveButtonIndex: moreActionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
            if(buttonIndex !== undefined && buttonIndex < moreActions.length) {
                this.onMoreActionSelected(buttonIndex, index);
              }
        });
    }

    onMoreActionSelected(actionIndex, selectedItemIndex) {
        let action = moreActionsIOS[actionIndex];
        if(action == ACTION_EDIT) {
            this.editWorkout(selectedItemIndex);
        }
    }

    showWorkoutDetails(selectedIndex) {
        let workout = this.state.workoutList[selectedIndex];
        let params = {};
        params[Constants.KEY_WORKOUT_ID] = workout[Constants.KEY_ID];
        params[Constants.KEY_EXERCISES] = this.state.exerciseList;
        this.props.navigation.navigate("WorkoutDetails", params);
    }

    editWorkout(selectedIndex) {
        let workout = this.state.workoutList[selectedIndex];
        console.log("selected workout:::");
        console.log(workout);
        let params = {};
        params[Constants.KEY_GYM_ID] = this.state.gymID;
        params[Constants.KEY_MEMBER_ID] = this.state.memberID;
        params[Constants.KEY_WORKOUT_ID] = workout[Constants.KEY_ID];
        params[Constants.KEY_EXERCISES] = this.state.exerciseList;
        //params[Constants.KEY_FROM_WORKOUT] = workout[Constants.KEY_ID];
        this.props.navigation.navigate("CreateOrEditWorkout", params);
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
        backgroundColor:'#161a1e',
        paddingHorizontal: 10,
    },
    titleBannerContainer: {
        flexGrow:1,
        justifyContent:'flex-start',
        alignItems:'center',
    },
    titleBanner: {
        width:199,
        height:36,
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

export default withNavigationFocus(MemberWorkoutScreen);
