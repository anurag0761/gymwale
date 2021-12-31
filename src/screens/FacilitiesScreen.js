import React, {Component} from 'react';
import {
  Text,
  FlatList,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';

// import { Card } from "react-native-elements";
import CardView from 'react-native-rn-cardview';
import {withNavigationFocus} from 'react-navigation';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import facilitygymReducer from '../Redux/Reducer/facilitygymReducer';
import {facilityupdate, fetchGymFacility} from '../Redux/Actions/facilityaction';

class FacilitiesScreen extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    //let willShowNextButton = globals.getSetting()[globals.KEY_USER_ACCOUNT_SETUP_STATUS] === globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED ? false: true;
    let willStopChildFlatListScrolling =
      properties.willStopChildFlatListScrolling;
    this.state = {
      gymID: gymID,
      //willShowNextButton: willShowNextButton,
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      gymFacilities: [],
      willStopChildFlatListScrolling,
    };
  }

  componentDidMount() {
    // this.pgymFacilitiesData

    this.fetchGymFacilities();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.updateData();
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  async updateData() {
    await this.updateGymInfo();
    this.fetchGymFacilities();
  }

  async updateGymInfo() {
    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    await this.promisedSetState({
      gymID: gymID,
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      gymFacilities: [],
    });
  }

  promisedSetState = (newState) => {
    return new Promise((resolve) => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  render() {
    if (this.props.Loading) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            size="large"
            color="#161a1e"
            style={{marginTop: 35}}
          />
        </View>
      );
    }

    if (this.props.success === false) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchGymFacilities();
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mainContainer}>
        <FlatList
          style={{width: '100%'}}
          data={this.props.gymFacilitiesData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => this.renderItem(item, index)}
          numColumns={3}
          scrollEnabled={!this.state.willStopChildFlatListScrolling}
        />
        {/*
                    this.state.willShowNextButton ? (
                        <TouchableOpacity onPress={this.next} style={{width:'100%'}}>
                        <View style={styles.nextButton}> 
                            <Text style={{color:'white', fontSize:16, textAlign: 'center'}}>NEXT</Text>
                        </View>
                    </TouchableOpacity>
                    ): null
                */}
        {this.props.Loading ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
        ) : null}
      </View>
    );
  }

  fetchGymFacilities() {
    let thisInstance = this;
    this.setState({
      isFetchingData: true,
    });
    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);

    console.log('BODY:::');
    console.log(data);
    this.props.fetchGymFacility(data);
    // fetch(Constants.API_URL_GYM_FACILITIES, {
    // 	method: 'post',
    //     body: data,
    // 	headers: {
    //         'Content-type':'multipart/form-data',
    // 		'Accept': 'application/json',
    // 	}
    //   })
    // .then((response) => {
    //     console.log("Response:::");
    //     console.log(response);
    //     return response.json();
    // })
    // .then((responseJson) => {
    //     console.log("Response JSON:::");
    //     console.log(responseJson);

    //     let valid = responseJson[Constants.KEY_VALID];
    //     if(valid) {
    //         let gymFacilities = responseJson[Constants.KEY_BODY];

    //         thisInstance.setState({
    //             gymFacilities: gymFacilities,
    //             isDataLoaded: true,
    //             isFetchingData: false,
    //         });

    //     } else {
    //         let message = responseJson[Constants.KEY_MESSAGE];
    //         if(!(message && message.length > 0)) {
    //             message = 'Some error occurred. Please try agian.';
    //         }
    //         thisInstance.setState({
    //             isFetchingData: false,
    //         });
    //         Utils.showAlert("Error!", message);
    //     }
    // })
    // .catch((error) => {
    //     thisInstance.setState({
    //         isFetchingData: false
    //     });
    //     console.log("Error while fetching facitlities....");
    //     console.log(error);
    //     Utils.showAlert("Some error occurred. Please try again.");
    // });
  }

  next = () => {
    let allFacilties = this.state.gymFacilities;
    let selectedFacilityIDs = [];
    for (let i = 0; i < allFacilties.length; i++) {
      let faciltity = allFacilties[i];
      if (faciltity[Constants.KEY_IS_SELECTED]) {
        selectedFacilityIDs.push(faciltity[Constants.KEY_ID]);
      }
    }

    if (selectedFacilityIDs.length > 0) {
      this.updateFacilities(selectedFacilityIDs);
    } else {
      this.goToGalleryScreen();
    }
  };

  updateFacilities(faciltiyIDList) {
    let thisInstance = this;
    this.setState({
      isLoading: true,
    });
    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_FACILITIES, JSON.stringify(faciltiyIDList));

    console.log('BODY:::');
    console.log(data);
    this.props.facilityupdate(data)
   setTimeout(() => {
     if (this.props.updatedataData.success) {
     
      let valid = this.props.updatedataData.updatefacility[Constants.KEY_VALID];
      if (valid) {
        //let willShowNextButton = thisInstance.state.willShowNextButton;

        thisInstance.setState({
          isLoading: false,
        });
        /*
              if(willShowNextButton) {
                  globals.setOneSetting(globals.KEY_USER_ACCOUNT_SETUP_STATUS, globals.KEY_ACCOUNT_SETUP_STATUS_GYM_FACILITIES_DONE);
                  thisInstance.goToGalleryScreen();
              }
              */
        Utils.showAlert('', 'Facilities Saved Successfully.');
      } 
     }
     else {
      
       let message = 'Some error occurred. Please try agian.';
      
      thisInstance.setState({
        isLoading: false,
      });
      Utils.showAlert('Error!', message);
    }
   }, 1500);

      
  }

  goToGalleryScreen() {
    this.props.goToNextPage();
  }

  renderItem(item, index) {
    let facilityName = item[Constants.KEY_NAME];
    let isSelected = item[Constants.KEY_IS_SELECTED];
    let tintColor = isSelected ? '#57a2fd' : '#404040';
    let backgroundColor = isSelected ? '#162029' : 'white';
    let imageURL = item[Constants.KEY_IMAGE];

    return (
      <TouchableHighlight
        style={styles.innerCard}
        onPress={() => this.toggleFacility(index)}>
        <CardView
          cardElevation={4}
          maxCardElevation={4}
          radius={2}
          backgroundColor={backgroundColor}
          style={styles.faciltityContainer}>
          <Image
            tintColor={tintColor}
            source={{uri: imageURL}}
            style={{height: 40, width: '100%'}}
            resizeMode={'contain'}
          />
          <Text
            style={{
              fontSize: 14,
              color: tintColor,
              textAlign: 'center',
              marginTop: 10,
              marginBottom: 5,
            }}>
            {facilityName}
          </Text>
        </CardView>
      </TouchableHighlight>
    );
  }

  toggleFacility(index) {
    let facilities = this.props.gymFacilitiesData;
    facilities[index][Constants.KEY_IS_SELECTED] =
      !facilities[index][Constants.KEY_IS_SELECTED];
    this.setState({
      gymFacilities: facilities,
    });
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3d4a55',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicatorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99999999,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  nextButton: {
    width: '100%',
    height: 35,
    backgroundColor: '#2c9fc9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCard: {
    //flex:1,
    width: '33.33%',
    height: 100,
  },
  faciltityContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

const mapStateToprops = (state) => {
  //     console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
  // console.log(state)
  // console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
  return {
    gymFacilitiesData: state.FacilitygymReducer.gymfacility,
    updatedataData: state.FacilitygymReducer,

    Loading: state.FacilitygymReducer.isLoading,
    Success: state.FacilitygymReducer.success,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      fetchGymFacility: fetchGymFacility,
      facilityupdate: facilityupdate,
    },
    dispatch,
  );
}
export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(withNavigationFocus(FacilitiesScreen));
