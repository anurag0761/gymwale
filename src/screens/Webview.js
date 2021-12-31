import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator
    , Platform, Keyboard, TouchableWithoutFeedback, FlatList } from 'react-native';
import { WebView } from 'react-native-webview';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';


class Webview extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let userData = userInfo[Constants.KEY_USER_DATA];
        let userID = userData[Constants.KEY_ID];
        
        let pageLink = properties.navigation.getParam(Constants.KEY_PAGELINK, "http://gymvale.com");
        let pageTitle = properties.navigation.getParam(Constants.KEY_NAME, "GymVale.com");

        this.state = {
            gymID: gymID,
            userID: userID,
            pageLink: pageLink,
            pageTitle: pageTitle,
        };
    }

    componentDidMount() {
    }

	render() {

        return (
            
                <View style={{flex:1, backgroundColor:'#fafafa'}}>
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
                            
                            <Text style={[styles.tabTitle, {color:'white'}]}>{this.state.pageTitle}</Text>
                        </View>
                        <WebView
                            source={{ uri: this.state.pageLink }}
                            style={{ flex: 1 }}
                            javaScriptEnabled={true}
                            startInLoadingState={true}
                            scrollEnabled={true}
                            useWebKit={true}
                        />
                    </View>
                    
                </View>
            
			
		);
    }

    goBack = () => {
        this.props.navigation.pop();
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
});

export default Webview;
