import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
     ,TouchableHighlight, Platform, TextInput, Button } from 'react-native';

import ActionButton from 'react-native-action-button';
import ActionSheet from 'react-native-action-sheet';
import RNPickerSelect from 'react-native-picker-select';
import { CheckBox } from "react-native-elements";
import { getStatusBarHeight } from 'react-native-status-bar-height';

import Icon from 'react-native-vector-icons/Ionicons';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import Toast, {DURATION} from 'react-native-easy-toast';

const daysOptions = [
    {label:"Day 1", value:'0'},
    {label:"Day 2", value:'1'},
    {label:"Day 3", value:'2'},
    {label:"Day 4", value:'3'},
    {label:"Day 5", value:'4'},
    {label:"Day 6", value:'5'},
    {label:"Day 7", value:'6'},
];

const BODY_PART_ALL = "All";

class AddExerciseToWorkout extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let exercises = properties.navigation.getParam(Constants.KEY_EXERCISES);
        let exercisesList = {};
        for(let i = 0; i < exercises.length; i++) {
            let exerciseID = exercises[i][Constants.KEY_EXERCISE_ID];
            exercisesList[exerciseID] = exercises[i];
        }

        this.state = {
            gymID: gymID,
            exercises:exercises,
            exercisesList: exercisesList,
            isLoading: false,
            isDataLoaded: false,
            bodyPartsList:[],
            selectedDay:"0",
            selectedBodyPart:BODY_PART_ALL,
            isExerciseSelectedList:{},
            bodyPartsOptions:[],
            exercisesIDList:[],
        };
    }

    componentDidMount() {
        this.fetchBodyParts();
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
                            this.fetchBodyParts();
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
			<View style={{flex:1, backgroundColor:'#fafafa'}}>
                <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                    <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                </View>

                <View style={[styles.headerContainer, {backgroundColor:'#0091ea', padding:10}]}>
                    <TouchableOpacity
                        onPress={this.goBack}
                    >
                        <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                    </TouchableOpacity>
                    
                    <Text style={[styles.tabTitle, {color:'white'}]}>Add Exercise</Text>
                </View>
                
                <View style={{backgroundColor:'transparent', padding:20,}}>
                    <View style={[styles.headerContainer, {backgroundColor:'white'}]}>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                            <RNPickerSelect
                                onValueChange={(value) => {
                                    this.onDayChanged(value);
                                }}
                                items={daysOptions}
                                value={this.state.selectedDay}
                                style={{
                                    ...pickerSelectStyles,
                                    iconContainer: {
                                        top: 18,
                                        right: 0,
                                    },
                                }}
                                useNativeAndroidPickerStyle={false}
                                placeholder={{}}
                                Icon={() => {
                                    return <Image style={styles.dropDownArrow} source={require('../../assets/images/down_arrow_button.png')} resizeMode={"cover"} />;
                                }}
                            />
                            
                        </View>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end', alignItems:'center'}}>
                            <RNPickerSelect
                                onValueChange={(value) => {
                                    this.onBodyPartChanged(value);
                                }}
                                items={this.state.bodyPartsOptions}
                                value={this.state.selectedBodyPart}
                                style={{
                                    ...pickerSelectStyles,
                                    iconContainer: {
                                        top: 18,
                                        right: 0,
                                    },
                                }}
                                useNativeAndroidPickerStyle={false}
                                placeholder={{}}
                                Icon={() => {
                                    return <Image style={styles.dropDownArrow} source={require('../../assets/images/down_arrow_button.png')} resizeMode={"cover"} />;
                                }}
                            />
                            
                        </View>
                    </View>
                </View>
                

                <FlatList
                    style={{ width: "100%", flexGrow:1}}
                    data={this.state.exercisesIDList}
                    keyExtractor={(item, index) => {
                        return index+"";
                    }}
                    renderItem={({ item, index }) => this.renderExerciseItem(item)}
                    ItemSeparatorComponent={this.renderSeparator}
                />
                <TouchableOpacity 
                    onPress={this.addExercise}
                >
                    <Text style={styles.addButton}>ADD</Text>
                </TouchableOpacity>

                {/*
                    this.state.isLoading ? (
                        <View style={styles.activityIndicatorContainer}>
                            <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                        </View>
                    ): null
                    */
                }
                <Toast ref="toast"/>
            </View>
		);
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    fetchBodyParts() {
        this.setState({
            isLoading: true,
        });
        
        let thisInstance = this;
        fetch(Constants.API_URL_BODY_PARTS_LIST)
		.then((response) => response.json())
		.then((responseJson) => {
            //console.log(responseJson);
            let bodyPartsOptions = [];
            bodyPartsOptions.push({
                'label' : BODY_PART_ALL, 'value': BODY_PART_ALL
            });
            let bodyPartsList = responseJson;
            for(let i = 0; i < bodyPartsList.length; i++) {
                let option = {};
                let bodyPart = bodyPartsList[i];
                option["label"] = bodyPart[Constants.KEY_BODY_PART_TITLE];
                option["value"] = bodyPart[Constants.KEY_BODY_PART_TITLE];
                bodyPartsOptions.push(option);
            }
            let exercisesIDList = thisInstance.getExerciseIDListBodyPart(BODY_PART_ALL);
            let isExerciseSelectedList = {};
            for(let i = 0; i < exercisesIDList.length; i++) {
                let exercise = exercisesIDList[i];
                isExerciseSelectedList[exercise[Constants.KEY_EXERCISE_ID]] = false;
            }
            thisInstance.setState({
                bodyPartsList: bodyPartsList,
                bodyPartsOptions: bodyPartsOptions,
                exercisesIDList: exercisesIDList,
                isExerciseSelectedList: isExerciseSelectedList,
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

    getExerciseIDListBodyPart(bodyPart) {
        console.log("Body Part:::"+ bodyPart);
        let exercisesList = this.state.exercises;
        let exercisesIDList = [];
        for(let i = 0; i < exercisesList.length; i++) {
            let exercise = exercisesList[i];
            let exerciseBodyParts = exercise[Constants.KEY_BODY_PART_TITLE].split(",");
            if(bodyPart === BODY_PART_ALL || exerciseBodyParts.includes(bodyPart) === true) {
                exercisesIDList.push(exercise[Constants.KEY_EXERCISE_ID]);
            }
        }
        return exercisesIDList;
    }

    onDayChanged(day) {
        let exercisesIDList = this.state.exercisesIDList;
        let isExerciseSelectedList = {};
        for(let i = 0; i < exercisesIDList.length; i++) {
            let exercise = exercisesIDList[i];
            isExerciseSelectedList[exercise[Constants.KEY_EXERCISE_ID]] = false;
        }
        this.setState({
            selectedDay: day,
            exercisesIDList: exercisesIDList,
            isExerciseSelectedList: isExerciseSelectedList,
        });
    }

    onBodyPartChanged(bodyPart) {
        let exercisesIDList = this.getExerciseIDListBodyPart(bodyPart);
        let isExerciseSelectedList = {};
        for(let i = 0; i < exercisesIDList.length; i++) {
            let exercise = exercisesIDList[i];
            isExerciseSelectedList[exercise[Constants.KEY_EXERCISE_ID]] = false;
        }
        this.setState({
            selectedBodyPart: bodyPart,
            exercisesIDList: exercisesIDList,
            isExerciseSelectedList: isExerciseSelectedList,
        });
    }
    
    addExercise = () => {
        let selectedExercisesIDList = [];
        let exercisesIDList = this.state.exercisesIDList;
        let isExerciseSelectedList = this.state.isExerciseSelectedList;
        for(let i = 0; i < exercisesIDList.length; i++) {
            if(isExerciseSelectedList[exercisesIDList[i]] === true) {
                selectedExercisesIDList.push(exercisesIDList[i]);
            }
        }
        let bodyPartIndex = 0;
        let bodyPartOptions = this.state.bodyPartsOptions;
        for(let i = 0; i < bodyPartOptions.length; i++) {
            let bodyPartOption = bodyPartOptions[i];
            if(bodyPartOption.value === this.state.selectedBodyPart) {
                bodyPartIndex = i;
                break;
            }
        }
        this.props.navigation.state.params.addDayExercises(parseInt(this.state.selectedDay), bodyPartIndex ,selectedExercisesIDList);

        this.refs.toast.show('Exercise added successfully',DURATION.LENGTH_LONG);
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

    renderExerciseItem(exerciseID) {
        let exercise = this.state.exercisesList[exerciseID];
        let imageURL = Constants.IMAGE_BASE_URL_EXERCISE + exercise[Constants.KEY_EXERCISE_IMAGE];
        let exerciseTitle = exercise[Constants.KEY_EXERCISE_TITLE];
        let exerciseLevel = exercise[Constants.KEY_LEVEL_TITLE];
        let iconImage = this.state.isExerciseSelectedList[exerciseID]? require('../../assets/images/checked_icon.png') : require('../../assets/images/unchecked_icon.png')
        return (
            <TouchableHighlight onPress={()=>this.goToExerciseDetailScreen(exerciseID)}>
                <View style={[styles.headerContainer, {backgroundColor:'white', paddingHorizontal:20, paddingVertical:5}]} key={"exercise_"+exerciseID}>
                    <Image style={styles.exerciseImage} resizeMode={"cover"} source={{uri:imageURL}} />
                    <View style={styles.exerciseInfoContainer}>
                        <Text style={styles.exerciseTitle}>{exerciseTitle}</Text>
                        <Text style={styles.exerciseLevelText}>{exerciseLevel}</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={()=> {
                            this.toggleExerciseSelection(exerciseID);
                        }}
                        
                    >
                        <View style={[styles.checkedIcon, {marginRight: 10,}]}>
                            <Image style={styles.checkedIcon} resizeMode={"cover"}  source={iconImage} />
                        </View>
                        
                    </TouchableOpacity>
                    {/*
                    <CheckBox
                        center
                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0 }}
                        size={20}
                        checked={this.state.isExerciseSelectedList[exerciseID]}
                        onPress={() =>
                            this.toggleExerciseSelection(exerciseID)
                        }
                    />
                    */}
                </View>
            </TouchableHighlight>
            
        );
    }

    toggleExerciseSelection(exerciseID) {
        let isExerciseSelectedList = this.state.isExerciseSelectedList;
        isExerciseSelectedList[exerciseID] = !isExerciseSelectedList[exerciseID];
        this.setState({
            isExerciseSelectedList: isExerciseSelectedList,
        });
    }

    goToExerciseDetailScreen(exerciseID) {
        let params = {};
        params[Constants.KEY_EXERCISE_DETAIL] = this.state.exercisesList[exerciseID];
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
        justifyContent:'flex-start',
        alignItems:'center',
    },
    titleBanner: {
        width:199,
        height:36,
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
        marginRight:10,
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
    dropDownArrow: {
        width: 20,
        height: 11,
        resizeMode: 'cover',
        //position:'absolute',
        //right: 5,
        //top: 20,
        marginLeft: 10,
    },
    moreIcon: {
        width:5,
        height:22.5,
    },
    deleteIcon: {
        width:22,
        height:22,
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
        fontSize:14,
        color:'#343434',
        textAlign:'left',
        flex: 1, 
        flexWrap: 'wrap',
    },
    exerciseLevelText: {
        fontSize:12,
        color:'grey',
        textAlign:'left',
        flex: 1, 
        flexWrap: 'wrap',
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
    textInput: {
        flexGrow:1,
        marginHorizontal: 10,
        color:"#343434",
        fontSize: 18,
    },
    addButton: {
        width:'100%',
        color:'white',
        backgroundColor:'#2c9fc9',
        lineHeight:35,
        height:35,
        textAlign:'center',
        textAlignVertical:'center',
    },
    checkedIcon: {
        width:21,
        height:21,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        //paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        textAlign:'left',
        borderWidth:0,
        paddingRight:30,
    },
    inputAndroid: {
        //paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        textAlign:'left',
        borderWidth:0,
        paddingRight:30,
    },
  });

export default AddExerciseToWorkout;