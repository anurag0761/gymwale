import React, {Component} from 'react';
import { StyleSheet, View, Text, Image, StatusBar, Dimensions, TouchableHighlight, ImageBackground } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const logoSize = screenWidth*(476/750);

import * as globals from '../utils/globals';
 
const slides = [
  {
    key: 'first',
    title: '',
    text: '',
    image: null,
    backgroundColor: '#161a1e',
  },
  {
    key: 'second',
    title: '',
    text: '',
    image: require('../../assets/images/qr_scan.gif'),
    backgroundColor: '#161a1e',
  },
  {
    key: 'third',
    title: '',
    text: '',
    image: require('../../assets/images/secure.gif'),
    backgroundColor: '#161a1e',
  }
];
 
class IntroScreen extends Component {

    constructor(properties) {
        super(properties);

        let motivationalQuotes = globals.getMotivationalQuotes();
        let randomQuoteIndex = Math.floor(Math.random()* motivationalQuotes.length);
        let motivationalQuote = motivationalQuotes[randomQuoteIndex];

        this.state = {
            motivationalQuote: motivationalQuote,
        };
    }

    render() {
        return (
            <AppIntroSlider 
                renderItem={this._renderItem} 
                data={slides} 
                onDone={this._onDone}
                onSkip={this._onDone}
                showSkipButton
                bottomButton
                showNextButton={false}
                renderDoneButton={this._renderDoneButton}
            />
        );
    }

    _renderItem = (item) => {
        // console.log("item:::");
        // console.log(item);
        if(item.item.key === 'first') {
            return (
                
                <View style={styles.slide}>
                    <Image 
                        source={require('../../assets/images/splash_logo.png')} 
                        style={{
                            width: logoSize,
                            height: logoSize,
                         }} 
                        width={logoSize}
                        height={logoSize}
                        resizeMode="contain"
                    />

                    <Text 
                        style={styles.bottomTextStyle}
                    >
                    {this.state.motivationalQuote}
                    </Text>
                </View>
            );
        } else {
            {/*
                <TouchableHighlight style={styles.slide}>
                    <View style={styles.slide}>
                        <Image 
                            source={item.item.image} 
                            style={{resizeMode:"contain"}} 
                            width={screenWidth}
                            height={screenHeight}
                        />
                    </View>
                </TouchableHighlight>
                */}
            return (
                
                <ImageBackground
                    source={item.item.image}
                    style={styles.slide}
                >
                    <View></View>
                </ImageBackground>
            );
        }

        
    }

    _renderDoneButton = () => {
        return (
            <View style={{width:'100%', height:35, backgroundColor:'#17aae0', justifyContent:'center', alignItems:'center'}}>
                <Text style={{color:'white', fontSize:15}}>Done</Text>
            </View>
        );
      };

    _onDone = () => {
        globals.setOneSetting(globals.KEY_WILL_SHOW_INTRO, false);
 console.log(       globals.getSetting()[globals.KEY_WILL_SHOW_INTRO],',,,,,,,,,,,,,,,,,,,,,,,')

        // globals._storeData('log',true)
        // globals._storeData(globals.KEY_WILL_SHOW_INTRO,false)
        // globals._storeData(globals.KEY_CAN_USE_PAID_FEATURES,true)

        this.props.navigation.navigate('Auth');
    }
}

const styles = StyleSheet.create({
    slide: {
        flex:1,
        backgroundColor:'#161a1e',
        justifyContent:'center',
        alignItems:'center',
    },
    bottomTextStyle: {
        color:"white", 
        marginTop:20, 
        width:logoSize, 
        textAlign:'center', 
        paddingHorizontal:20,
    },
});

export default IntroScreen;