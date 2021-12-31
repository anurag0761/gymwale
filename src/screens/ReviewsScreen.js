import React, { Component } from 'react';
import { Text, StatusBar, Image, View, Dimensions, StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const screenWidth = Dimensions.get("window").width;
const logoSize = screenWidth*(512/750);

class ReviewsScreen extends Component {

	render() {

        return (
			<View
				style={[
					{ flex: 1 },
					{ backgroundColor: '#161a1e' },
					{ justifyContent: 'center' },
					{ alignItems: 'center' }
				]}
			>
                <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                    <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                </View>

				<Image 
                    source={require('../../assets/images/logo.png')} 
                    style={{ resizeMode: 'contain' }} 
                    width={logoSize}
                    height={logoSize}/>

                <Text 
                    style={styles.bottomTextStyle}
                >
                Here will be Reviews 
                </Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
    bottomTextStyle: {
        color:"white", 
        marginTop:20, 
        width:logoSize, 
        textAlign:'center', 
        paddingHorizontal:20,
    },
});

export default ReviewsScreen;
