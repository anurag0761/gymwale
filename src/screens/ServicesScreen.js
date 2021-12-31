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
import {addOrEditSubplanAction} from '../Redux/Actions/addOrEditSubplanAction';
import {
  fetchGymServices,
  updateServices,
} from '../Redux/Actions/fetchGymservices';

class ServicesScreen extends Component {
  constructor(properties) {
    console.log('ServicesScreen Constructor:::');
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
      gymServices: [],
      willStopChildFlatListScrolling,
    };
  }

  componentDidMount() {
    // toggleService(index) {
    //     let services = this.props.gymServicesData;
    //     services[index][Constants.KEY_IS_SELECTED] = !services[index][Constants.KEY_IS_SELECTED];
    //     this.setState({
    //         gymServices: services
    //     });
    // }

    this.fetchGymServices();
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
    this.fetchGymServices();
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
      gymServices: [],
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

    if (this.props.Success === false) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchGymServices();
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
          data={this.props.gymServicesData}
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

  fetchGymServices() {
    console.log('Fecthing Gym Services....');
    let thisInstance = this;
    this.setState({
      isFetchingData: true,
    });
    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);

    console.log('BODY:::');
    console.log(data);
    this.props.FetchGymServices(data);
    // fetch(Constants.API_URL_GYM_SERVICES, {
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
    //     console.log("Response JSON in fetchGymServices:::");
    //     console.log(responseJson);

    //     let valid = responseJson[Constants.KEY_VALID];
    //     if(valid) {
    //         let gymServices = responseJson[Constants.KEY_BODY];

    //         thisInstance.setState({
    //             gymServices: gymServices,
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
    //     console.log("Error while fetching services....");
    //     console.log(error);
    //     Utils.showAlert("Some error occurred. Please try again.");
    // });

    // this.props.addOrEditSubplanActionDispatch(data)
  }

  next = () => {
    let allServices = this.state.gymServices;
    let selectedServiceIDs = [];
    for (let i = 0; i < allServices.length; i++) {
      let service = allServices[i];
      if (service[Constants.KEY_IS_SELECTED]) {
        selectedServiceIDs.push(service[Constants.KEY_ID]);
      }
    }

    if (selectedServiceIDs.length > 0) {
      this.updateServices(selectedServiceIDs);
    } else {
      this.goToFacilitiesScreen();
    }
  };

  updateServices = (serviceIDList) => {
    let thisInstance = this;
    this.setState({
      isLoading: true,
    });
    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_SERVICES, JSON.stringify(serviceIDList));

    console.log('BODY:::');
    console.log(data);
    this.props.updateServices(data);
    setTimeout(() => {
      let valid =
        this.props.updateServicesdata.updateservices[Constants.KEY_VALID];
      if (this.props.updateServicesdata.success) {
        if (valid) {
          //let willShowNextButton = thisInstance.state.willShowNextButton;

          thisInstance.setState({
            isLoading: false,
          });

          Utils.showAlert('', 'Services Saved Successfully.');
        }
      } else {
        let message = 'Some error occurred. Please try agian.';

        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    }, 2000);
  };

  goToFacilitiesScreen() {
    this.props.goToNextPage();
  }

  renderItem(item, index) {
    let serviceName = item[Constants.KEY_NAME];
    let isSelected = item[Constants.KEY_IS_SELECTED];
    let tintColor = isSelected ? '#57a2fd' : '#404040';
    let backgroundColor = isSelected ? '#162029' : 'white';
    let imageURL = item[Constants.KEY_IMAGE];

    return (
      <TouchableHighlight
        style={styles.innerCard}
        onPress={() => this.toggleService(index)}>
        <CardView
          cardElevation={4}
          maxCardElevation={4}
          radius={2}
          backgroundColor={backgroundColor}
          style={styles.serviceContainer}>
          <Image
            tintColor={tintColor}
            source={{uri: imageURL}}
            style={{height: 40, width: '100%'}}
            resizeMode={'contain'}
          />
          <Text
            style={{
              fontSize: 12,
              color: tintColor,
              textAlign: 'center',
              marginTop: 10,
              marginBottom: 5,
            }}>
            {serviceName}
          </Text>
        </CardView>
      </TouchableHighlight>
    );
  }

  toggleService(index) {
    let services = this.props.gymServicesData;
    services[index][Constants.KEY_IS_SELECTED] =
      !services[index][Constants.KEY_IS_SELECTED];
    this.setState({
      gymServices: services,
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
  serviceContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
});
const mapStateToprops = (state) => ({
  gymServicesData: state.FetchGymServiceReducer.gymService,
  updateServicesdata: state.FetchGymServiceReducer,
  Loading: state.FetchGymServiceReducer.isLoading,
  Success: state.FetchGymServiceReducer.success,
});

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      FetchGymServices: fetchGymServices,
      updateServices: updateServices,
    },
    dispatch,
  );
}

export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(withNavigationFocus(ServicesScreen));
