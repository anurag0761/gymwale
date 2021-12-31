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

import CardView from 'react-native-rn-cardview';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {fetchGymServices} from '../Redux/Actions/fetchGymservices';
import {getmygym} from '../Redux/Actions/GetmyGymAction';

class GymServicesScreen extends Component {
  constructor(properties) {
    console.log('ServicesScreen Constructor:::');
    super(properties);

    let gymID = properties.gymID;

    this.state = {
      gymID: gymID,
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      gymServices: [],
    };
  }

  componentDidMount() {
    this.fetchGymServices();
  }

  render() {
    if (this.state.isFetchingData) {
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

    if (this.state.isDataLoaded === false) {
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
          data={this.state.gymServices}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => this.renderItem(item, index)}
          numColumns={3}
        />
        {this.state.isLoading ? (
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
    this.props.dispatchgetmygym(data).then(() => {
      let valid = this.props.getmygymReducer.data[Constants.KEY_VALID];
      if (valid) {
        let gymServices =
          this.props.getmygymReducer.data[Constants.KEY_SERVICE];

        thisInstance.setState({
          gymServices: gymServices,
          isDataLoaded: true,
          isFetchingData: false,
        });
      } else {
        let message = this.props.getmygymReducer.data[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isFetchingData: false,
        });
        Utils.showAlert('Error!', message);
      }
    });
  }

  renderItem(item, index) {
    let serviceName = item[Constants.KEY_TITLE];
    let tintColor = '#404040';
    let backgroundColor = 'white';
    let imageURL = item[Constants.KEY_IMAGE];

    return (
      <TouchableHighlight style={styles.innerCard}>
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

const mapStateToprops = (state) => {
  return {
    getmygymReducer: state.getmygymReducer,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      // FetchAllCity: fetchAllCity,
      dispatchgetmygym: getmygym,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(GymServicesScreen);
