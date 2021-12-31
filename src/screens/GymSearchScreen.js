import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  TouchableHighlight,
  Dimensions,
} from 'react-native';
import Share from 'react-native-share';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import CardView from 'react-native-rn-cardview';
import ActionSheet from 'react-native-action-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import GetLocation from 'react-native-get-location';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchAllCity} from '../Redux/Actions/getAllCityAction';

const screenWidth = Dimensions.get('window').width;

const sortOptionsIOS = ['Popularity', 'Distance', 'Featured', 'Cancel'];

const sortOptionsAndroid = ['Popularity', 'Distance', 'Featured'];

const sortStatuses = [
  Constants.GYM_SEARCH_SORT_BY_POPULAR,
  Constants.GYM_SEARCH_SORT_BY_DISTANCE,
  Constants.GYM_SEARCH_SORT_BY_FEATURED,
];

class GymSearchScreen extends Component {
  constructor(properties) {
    super(properties);

    let gymID = '';
    let memberID = '';

    let userInfo = globals.getSetting().userInfo;
    let body = userInfo[Constants.KEY_USER_DATA];
    let userType = body[Constants.KEY_USER_TYPE];
    if (userType === Constants.USER_TYPE_OWNER) {
      let gymData = userInfo[Constants.KEY_GYM_DATA];
      gymID = gymData[Constants.KEY_ID];
      memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, '');
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      let memberData = userInfo[Constants.KEY_MEMBER_DATA];
      memberData = memberData[0];
      memberID = memberData[Constants.KEY_MEMBER_ID];
      gymID = memberData[Constants.KEY_GYM_ID];
    }

    this.onEndReachedCalledDuringMomentum = true;

    this.state = {
      gymID: gymID,
      memberID: memberID,
      userType: userType,
      hasMoreData: true,
      searchText: '',
      isFetchingData: true,
      isDataLoaded: false,
      isShowingSearchView: false,
      gymList: [],
      currentPage: 1,
      latitude: '',
      longitude: '',
      cityID: '',
      sortBy: Constants.GYM_SEARCH_SORT_BY_FEATURED,
      cityName: '',
      priceRangeMin: '0',
      priceRangeMax: '10000',
      tempPriceRangeMin: 0,
      tempPriceRangeMax: 10000,
      gender: '',
      tempGender: '',
      tempCityID: '',
      tempCityName: '',
      topInfoContainerBackgroundColor: '#162029',
      topInfoContainerVerticalMargin: 20,
      allCities: [],
      willShowFilterOptions: false,
      imageBaseURL: 'https://gymvale.com/fiton/assets/uploads/images/',
      largeImageURL:
        'https://ik.imagekit.io/zffhug9o6d/tr:w-350,h-150/api/assets/uploads/images/large',
    };
  }

  componentDidMount() {
    this.fetchCities();
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: '#f7f7f7',
        }}>
        <View
          style={{
            height: getStatusBarHeight(true),
            backgroundColor: '#161a1e',
          }}>
          <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
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
            <TouchableOpacity onPress={this.goBack}>
              <Image
                style={styles.backIcon}
                source={require('../../assets/images/back_icon_white.png')}
              />
            </TouchableOpacity>
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

        {/*
                <View style={[styles.topInfoContainer, {backgroundColor:this.state.topInfoContainerBackgroundColor}]}>
                    <View style={{
                        flexDirection:'row', 
                        justifyContent:'center', 
                        alignItems:'center', 
                        width:'100%', 
                        marginBottom: 25, 
                        backgroundColor: 'white',
                        height: 32.5,
                        borderRadius: 2.5,
                        paddingHorizontal:10,
                    }}>
                        <TouchableOpacity style={{height:'100%', justifyContent:'center', alignItems:'center'}}>
                            <View style={{
                                flexDirection:'row', 
                                justifyContent: 'center', 
                                alignItems:'center',
                                minWidth: 200,
                            }}>
                                <Text style={{fontSize:12, color:'#1d2b36', flex:1}}>{this.state.cityName === '' ? 'Select City' : this.state.cityName}</Text>
                                <Image tintColor="#1d2b36" source={require('../../assets/images/down_arrow.png')} style={{height:5, width: 8}} resizeMode={"contain"} />
                            </View>
                        </TouchableOpacity>
                        
                    </View>
                    
                </View>
                */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
            height: 40,
            paddingHorizontal: 10,
          }}>
          <TouchableOpacity onPress={this.selectCity}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 12, color: '#1d2b36', marginRight: 10}}>
                {this.state.cityName === ''
                  ? 'Select City'
                  : this.state.cityName}
              </Text>
              <Image
                tintColor="#1d2b36"
                source={require('../../assets/images/down_arrow.png')}
                style={{height: 5, width: 8}}
                resizeMode={'contain'}
              />
            </View>
          </TouchableOpacity>
          <View style={{flexGrow: 1}}></View>
          <TouchableOpacity
            style={{marginRight: 25}}
            onPress={this.onSortButtonClicked}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}>
              <Image
                tintColor="#1d2b36"
                source={require('../../assets/images/sort_icon.png')}
                style={{height: 12, width: 14, marginRight: 10}}
                resizeMode={'contain'}
              />
              <Text style={{fontSize: 12, color: '#1d2b36'}}>Sort By</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.showFilters}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}>
              <Image
                tintColor="#1d2b36"
                source={require('../../assets/images/filter_icon.png')}
                style={{height: 12, width: 11, marginRight: 10}}
                resizeMode={'contain'}
              />
              <Text style={{fontSize: 12, color: '#1d2b36'}}>Filter</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/*<Text style={{width:'100%', textAlign:'center', fontSize:16, color:'red'}}>Latitude: {this.state.latitude} Longitude: {this.state.longitude}</Text>*/}
        <FlatList
          style={{width: '100%', paddingHorizontal: 10}}
          data={this.state.gymList}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          onEndReached={(distanceFromEnd) => this.onListEndReached()}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.onEndReachedCalledDuringMomentum = false;
          }}
        />

        {this.state.isFetchingData ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
        ) : null}

        {this.state.isFetchingData === false &&
        this.state.isDataLoaded === false ? (
          <View
            style={[
              styles.activityIndicatorContainer,
              {backgroundColor: 'transparent'},
            ]}>
            <TouchableOpacity
              onPress={() => {
                /*
                                    this.fetchData(this.state.searchText, this.state.currentPage, this.state.cityID, this.state.cityName
                                    , this.state.sortBy, this.state.latitude, this.state.longitude, this.state.priceRangeMin
                                    , this.state.priceRangeMax, this.state.gender);
                                    */
                this.fetchCities();
              }}
              style={{width: '100%'}}>
              <Text style={styles.button}>Retry to fetch data</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {this.state.willShowFilterOptions === true ? (
          <View
            style={[
              styles.activityIndicatorContainer,
              {
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-start',
              },
            ]}>
            <View
              style={{
                width: '100%',
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={[styles.headerContainer, {backgroundColor: 'white'}]}>
                <TouchableOpacity onPress={this.closeFilters}>
                  <Image
                    style={styles.closeIcon}
                    source={require('../../assets/images/close_icon.png')}
                  />
                </TouchableOpacity>

                <Text style={styles.tabTitle}>Filters</Text>
                <TouchableOpacity onPress={this.resetFilterOptions}>
                  <Text style={{color: '#242424', fontSize: 14}}>Reset</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 30,
                  width: '100%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'rgba(36, 36, 36, 0.7)',
                      fontSize: 13,
                      fontWeight: '500',
                      textAlign: 'left',
                      flexGrow: 1,
                    }}>
                    Price Range
                  </Text>
                  <Text
                    style={{color: '#242424', fontSize: 14, fontWeight: '500'}}>
                    {'₹ ' +
                      this.state.tempPriceRangeMin +
                      '-' +
                      this.state.tempPriceRangeMax}
                  </Text>
                </View>
                <MultiSlider
                  values={[
                    this.state.tempPriceRangeMin,
                    this.state.tempPriceRangeMax,
                  ]}
                  sliderLength={screenWidth - 60}
                  onValuesChange={this.onPriceRangeValueChange}
                  min={0}
                  max={10000}
                  step={1}
                  selectedStyle={{
                    backgroundColor: '#17aae0',
                  }}
                  markerStyle={{
                    backgroundColor: '#17aae0',
                  }}
                  pressedMarkerStyle={{
                    backgroundColor: '#17aae0',
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'rgba(36, 36, 36, 0.7)',
                      fontSize: 13,
                      fontWeight: '500',
                      textAlign: 'left',
                      flexGrow: 1,
                    }}>
                    Select Gender
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 20,
                  }}>
                  <TouchableOpacity onPress={this.onMaleGenderClicked}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 2.5,
                        borderWidth: 1.5,
                        width: 55,
                        height: 55,
                        borderColor:
                          this.state.tempGender === 'male'
                            ? '#17aae0'
                            : 'rgba(141,141,141,0.4)',
                      }}>
                      <Image
                        tintColor={
                          this.state.tempGender === 'male'
                            ? '#17aae0'
                            : 'rgba(141,141,141,0.4)'
                        }
                        source={require('../../assets/images/male_gender_sign.png')}
                        style={{height: 20, width: 20}}
                        resizeMode={'contain'}
                      />
                      <Text
                        style={{
                          color:
                            this.state.tempGender === 'male'
                              ? '#2c9fc9'
                              : '#989898',
                          fontSize: 11,
                          marginTop: 5,
                        }}>
                        Male
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: 'rgba(36, 36, 36, 0.702)',
                      fontSize: 15,
                      marginHorizontal: 40,
                    }}>
                    or
                  </Text>
                  <TouchableOpacity onPress={this.onFemaleGenderClicked}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 2.5,
                        borderWidth: 1.5,
                        width: 55,
                        height: 55,
                        borderColor:
                          this.state.tempGender === 'female'
                            ? '#17aae0'
                            : 'rgba(141,141,141,0.4)',
                      }}>
                      <Image
                        tintColor={
                          this.state.tempGender === 'female'
                            ? '#17aae0'
                            : 'rgba(141,141,141,0.4)'
                        }
                        source={require('../../assets/images/female_gender_sign.png')}
                        style={{height: 20, width: 20}}
                        resizeMode={'contain'}
                      />
                      <Text
                        style={{
                          color:
                            this.state.tempGender === 'female'
                              ? '#2c9fc9'
                              : '#989898',
                          fontSize: 11,
                          marginTop: 5,
                        }}>
                        Female
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={this.applyFilterOptions}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 12.5,
                      width: 90,
                      height: 25,
                      backgroundColor: '#17aae0',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 13,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                      }}>
                      Apply
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  getCurrentLocation = () => {
    let thisInstance = this;
    this.setState({
      isFetchingData: true,
    });

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 150000,
    })
      .then((location) => {
        console.log('Location:::');
        console.log(location);
        this.setState({
          latitude: '' + location.latitude,
          longitude: '' + location.longitude,
          sortBy: Constants.GYM_SEARCH_SORT_BY_DISTANCE,
        });
        thisInstance.fetchData(
          thisInstance.state.searchText,
          thisInstance.state.currentPage,
          thisInstance.state.cityID,
          thisInstance.state.cityName,
          Constants.GYM_SEARCH_SORT_BY_DISTANCE,
          location.latitude,
          location.longitude,
          thisInstance.state.priceRangeMin,
          thisInstance.state.priceRangeMax,
          thisInstance.state.gender,
        );
      })
      .catch((ex) => {
        const {code, message} = ex;
        console.warn(code, message);
        /*
                if (code === 'CANCELLED') {
                    Alert.alert('Location cancelled by user or by another request');
                }
                if (code === 'UNAVAILABLE') {
                    Alert.alert('Location service is disabled or unavailable. Please enable location service.');
                }
                if (code === 'TIMEOUT') {
                    Alert.alert('Location request timed out');
                }
                if (code === 'UNAUTHORIZED') {
                    Alert.alert('Authorization denied');
                }
                /*
                this.setState({
                    isFetchingData: false,
                });
                */
        thisInstance.fetchData(
          thisInstance.state.searchText,
          thisInstance.state.currentPage,
          thisInstance.state.cityID,
          thisInstance.state.cityName,
          thisInstance.state.sortBy,
          thisInstance.state.latitude,
          thisInstance.state.longitude,
          thisInstance.state.priceRangeMin,
          thisInstance.state.priceRangeMax,
          thisInstance.state.gender,
        );
      });
  };

  fetchCities() {
    // this.setState({
    //     isFetchingData: true,
    // });

    let thisInstance = this;
    // fetch(Constants.API_URL_GET_ALL_CITY)
    this.props.FetchAllCity();
    // .then((response) => response.json())
    // .then((responseJson) => {
    //     //console.log(responseJson);
    // let allCities = responseJson[Constants.KEY_BODY];
   setTimeout(() => {
    let allCities = this.props.allCitiesList;
    thisInstance.setState({
      allCities: allCities,
    });
   }, 2000);
    thisInstance.getCurrentLocation();
    // })
    // .catch((error) => {
    //     thisInstance.setState({
    //         isFetchingData : false
    //     });
    //     console.log("Error while fetching list....");
    //     console.log(error);
    // });
  }

  fetchData(
    searchText,
    page,
    cityID,
    cityName,
    sortBy,
    latitude,
    longitude,
    priceRangeMin,
    priceRangeMax,
    gender,
  ) {
    this.setState({
      isFetchingData: true,
    });

    let thisInstance = this;
    let body =
      Constants.KEY_S_SEARCH +
      '=' +
      searchText +
      '&' +
      Constants.KEY_PAGE +
      '=' +
      page +
      '&' +
      Constants.KEY_CITY_ID +
      '=' +
      cityID +
      '&' +
      Constants.KEY_CITY_NAME +
      '=' +
      cityName +
      '&' +
      Constants.KEY_SORT_BY +
      '=' +
      sortBy +
      '&' +
      Constants.KEY_LAT +
      '=' +
      latitude +
      '&' +
      Constants.KEY_LONG +
      '=' +
      longitude +
      '&' +
      Constants.KEY_PRICE_RANGE_MIN +
      '=' +
      priceRangeMin +
      '&' +
      Constants.KEY_PRICE_RANGE_MAX +
      '=' +
      priceRangeMax +
      '&' +
      Constants.KEY_GENDER +
      '=' +
      gender;

    console.log('BODY:::' + body);
    fetch(Constants.API_URL_GYM_SEARCH, {
      method: 'post',
      body: body,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
      .then((response) => {
        // console.log("Response of Gym Search::");
        // console.log(response);
        return response.json();
      })
      .then((responseJson) => {
        console.log('Response of Gym Search::');
        console.log(responseJson);
        let gymList = thisInstance.state.gymList;
        if (page === 1) {
          gymList = [];
        }
        let imageBaseURL = '';
        let largeImageURL = '';
        let valid = responseJson[Constants.KEY_VALID];
        if (valid === true) {
          let _gymList = responseJson[Constants.KEY_DATA];
          if (latitude !== '' && longitude !== '') {
            for (let i = 0; i < _gymList.length; i++) {
              let gymData = _gymList[i];
              let gymLatitude = gymData[Constants.KEY_LATITUDE];
              let gymLongitude = gymData[Constants.KEY_LONGITUDE];
              let distanceInKM = Math.round(
                Utils.getDistanceFromLatLonInKm(
                  parseFloat(latitude),
                  parseFloat(longitude),
                  parseFloat(gymLatitude),
                  parseFloat(gymLongitude),
                ),
              );
              gymData[Constants.KEY_DISTANCE_IN_KM] = '' + distanceInKM;
              _gymList[i] = gymData;
            }
          }
          gymList.push(..._gymList);
          console.log('Total Gyms:::' + gymList.length);
          imageBaseURL = responseJson[Constants.KEY_IMAGE_URL];
          largeImageURL = responseJson[Constants.KEY_LARGE_IMAGE_URL];
          thisInstance.setState({
            gymList: gymList,
            //imageBaseURL: imageBaseURL,
            largeImageURL: largeImageURL,
            isFetchingData: false,
            isDataLoaded: true,
            currentPage: page + 1,
          });
        } else {
          thisInstance.setState({
            isFetchingData: false,
            hasMoreData: false,
            isDataLoaded: true,
          });
        }
      })
      .catch((error) => {
        thisInstance.setState({
          isFetchingData: false,
        });
        console.log('Error while fetching gym search result list....');
        console.log(error);
      });
  }

  onSearchTextChanged = (text) => {
    this.setState({
      searchText: text,
      hasMoreData: true,
      currentPage: 1,
      gymList: [],
    });

    this.fetchData(
      text,
      1,
      this.state.cityID,
      this.state.cityName,
      this.state.sortBy,
      this.state.latitude,
      this.state.longitude,
      this.state.priceRangeMin,
      this.state.priceRangeMax,
      this.state.gender,
    );
  };

  showSearchBar = () => {
    this.setState({
      isShowingSearchView: true,
    });
  };

  hideSearchBar = () => {
    this.setState({
      isShowingSearchView: false,
      searchText: '',
    });
  };

  selectCity = () => {
    let navigationParams = {};
    navigationParams[Constants.KEY_ITEM_LIST] = this.state.allCities;
    navigationParams[Constants.KEY_PROPERTY_TO_SHOW_AS_LABEL] =
      Constants.KEY_NAME;
    navigationParams[Constants.KEY_ON_ITEM_SELECTED] = this.onCitySelected;
    this.props.navigation.navigate('ItemSelectScreen', navigationParams);
  };

  onCitySelected = (city) => {
    console.log('City Selected:::');
    console.log(city);
    let cityName = city[Constants.KEY_NAME];
    let cityID = city[Constants.KEY_ID];
    this.setState({
      cityName: cityName,
      cityID: cityID,
      currentPage: 1,
      hasMoreData: true,
      gymList: [],
    });

    this.fetchData(
      this.state.searchText,
      1,
      cityID,
      cityName,
      this.state.sortBy,
      this.state.latitude,
      this.state.longitude,
      this.state.priceRangeMin,
      this.state.priceRangeMax,
      this.state.gender,
    );
  };

  onSortButtonClicked = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Sort By',
        options: Platform.OS == 'ios' ? sortOptionsIOS : sortOptionsAndroid,
        cancelButtonIndex: sortOptionsIOS.length - 1,
        destructiveButtonIndex: sortOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        if (
          buttonIndex !== undefined &&
          buttonIndex < sortOptionsAndroid.length
        ) {
          this.onSortStatusSelected(buttonIndex);
        }
      },
    );
  };

  onSortStatusSelected(index) {
    this.setState({
      sortBy: sortStatuses[index],
      currentPage: 1,
      hasMoreData: true,
      gymList: [],
    });

    this.fetchData(
      this.state.searchText,
      1,
      this.state.cityID,
      this.state.cityName,
      sortStatuses[index],
      this.state.latitude,
      this.state.longitude,
      this.state.priceRangeMin,
      this.state.priceRangeMax,
      this.state.gender,
    );
  }

  showFilters = () => {
    this.setState({
      willShowFilterOptions: true,
    });
  };

  closeFilters = () => {
    this.setState({
      willShowFilterOptions: false,
    });
  };

  onPriceRangeValueChange = (values) => {
    console.log('Price range changed...');
    console.log(values);
    this.setState({
      tempPriceRangeMin: values[0],
      tempPriceRangeMax: values[1],
    });
  };

  onMaleGenderClicked = () => {
    this.setState({
      tempGender: 'male',
    });
  };

  onFemaleGenderClicked = () => {
    this.setState({
      tempGender: 'female',
    });
  };

  resetFilterOptions = () => {
    this.setState({
      tempPriceRangeMin: 0,
      tempPriceRangeMax: 10000,
      tempGender: '',
    });
  };

  applyFilterOptions = () => {
    let priceRangeMin = this.state.tempPriceRangeMin + '';
    let priceRangeMax = this.state.tempPriceRangeMax + '';
    let gender = this.state.tempGender;
    this.setState({
      priceRangeMin: priceRangeMin,
      priceRangeMax: priceRangeMax,
      gender: gender,
      currentPage: 1,
      gymList: [],
      willShowFilterOptions: false,
      hasMoreData: true,
    });

    this.fetchData(
      this.state.searchText,
      1,
      this.state.cityID,
      this.state.cityName,
      this.state.sortBy,
      this.state.latitude,
      this.state.longitude,
      priceRangeMin,
      priceRangeMax,
      gender,
    );
  };

  onListEndReached = () => {
    if (this.state.hasMoreData && !this.onEndReachedCalledDuringMomentum) {
      this.onEndReachedCalledDuringMomentum = true;
      this.fetchData(
        this.state.searchText,
        this.state.currentPage,
        this.state.cityID,
        this.state.cityName,
        this.state.sortBy,
        this.state.latitude,
        this.state.longitude,
        this.state.priceRangeMin,
        this.state.priceRangeMax,
        this.state.gender,
      );
    }
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#d6d6d6',
        }}
      />
    );
  };

  /*
    renderItem(item, index) {
        let profileImageURL = Constants.IMAGE_BASE_URL + item[Constants.KEY_IMAGE];
        let profileName = item[Constants.KEY_NAME];
        let cityName = item[Constants.KEY_CITY_NAME];
        let discount = "Trial Account";
        let discountColorCode = "#d5071a";
        if(item[Constants.KEY_DISCOUNT] !== Constants.DISCOUNT_TYPE_TRIAL_ACCOUNT) {
            discount = "₹ " + item[Constants.KEY_DISCOUNT];
            discountColorCode = "#126a03";
        }

        return(
            <TouchableHighlight>
                <View style={styles.memberInfoContainer}>
                    <Image style={styles.memberProfileImage} resizeMode={"cover"} source={{uri:profileImageURL}}/>
                    <View style={styles.profileInfoView}>
                        <Text style={styles.profileNameText}>{profileName}</Text>
                        <Text style={styles.membershipNameText}>{cityName}</Text>
                    </View>
                    <View style={{justifyContent:'center', alignItems:'center'}}>
                        <Text style={{fontWeight:'bold', color:discountColorCode, fontSize: 14}}>{discount}</Text>
                    </View>
                    
                </View>
            </TouchableHighlight>
            
        );
    }
    */

  renderItem(item, index) {
    let gymCoverImageURL =
      Constants.IMAGE_BASE_URL + '/' + item[Constants.KEY_COVER_IMAGE];

    let gymName = item[Constants.KEY_GYM_NAME];
    let gymDisplayLocation = item[Constants.KEY_GYM_DISPLAY_LOCATION];
    let distanceInKM = item[Constants.KEY_DISTANCE_IN_KM];

    let services = item[Constants.KEY_SERVICES_NAME];
    let service1ImageURL = '';
    let service2ImageURL = '';
    let service3ImageURL = '';

    if (services.length > 0) {
      service1ImageURL =
        this.state.imageBaseURL + services[0][Constants.KEY_IMAGE];

      if (services.length > 1) {
        service2ImageURL =
          this.state.imageBaseURL + services[1][Constants.KEY_IMAGE];
      }

      if (services.length > 2) {
        service3ImageURL =
          this.state.imageBaseURL + services[2][Constants.KEY_IMAGE];
      }
    }
    let facilities = item[Constants.KEY_FACILITIES_NAME];
    let facility1ImageURL = '';
    let facility2ImageURL = '';
    let facility3ImageURL = '';

    if (facilities.length > 0) {
      facility1ImageURL =
        this.state.imageBaseURL + facilities[0][Constants.KEY_IMAGE];

      if (facilities.length > 1) {
        facility2ImageURL =
          this.state.imageBaseURL + facilities[1][Constants.KEY_IMAGE];
      }

      if (facilities.length > 2) {
        facility3ImageURL =
          this.state.imageBaseURL + facilities[2][Constants.KEY_IMAGE];
      }
    }

    return (
      <TouchableHighlight
        onPress={() => {
          this.onGymSelected(index);
        }}>
        <CardView
          cardElevation={4}
          maxCardElevation={4}
          radius={4}
          backgroundColor={'#ffffff'}
          style={styles.cardViewStyle}
          padding={0}>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: '100%', height: 122}}
              resizeMode={'cover'}
              source={{uri: gymCoverImageURL}}
            />
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 15,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#202020',
                    fontSize: 12,
                    fontWeight: '500',
                    flexWrap: 'wrap',
                    flex: 1,
                    marginRight: 10,
                  }}>
                  {gymName}
                </Text>
                {service1ImageURL !== '' ? (
                  <Image
                    style={{width: 16, height: 16}}
                    resizeMode={'contain'}
                    source={{uri: service1ImageURL}}
                  />
                ) : null}
                {service2ImageURL !== '' ? (
                  <Image
                    style={{width: 16, height: 16, marginLeft: 5}}
                    resizeMode={'contain'}
                    source={{uri: service2ImageURL}}
                  />
                ) : null}
                {service3ImageURL !== '' ? (
                  <Image
                    style={{width: 16, height: 16, marginLeft: 5}}
                    resizeMode={'contain'}
                    source={{uri: service3ImageURL}}
                  />
                ) : null}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Image
                  tintColor="#656565"
                  source={require('../../assets/images/location_icon.png')}
                  style={{height: 12, width: 8, marginRight: 5}}
                  resizeMode={'contain'}
                />
                <Text
                  style={{
                    color: '#666666',
                    fontSize: 9,
                    flexWrap: 'wrap',
                    flex: 1,
                    marginRight: 10,
                  }}>
                  {gymDisplayLocation}
                </Text>
                {distanceInKM !== '' ? (
                  <Image
                    tintColor="#656565"
                    source={require('../../assets/images/dot_icon.png')}
                    style={{height: 3, width: 3, marginRight: 10}}
                    resizeMode={'contain'}
                  />
                ) : null}
                {distanceInKM !== '' ? (
                  <Text
                    style={{
                      color: '#666666',
                      fontSize: 9,
                      marginRight: 10,
                    }}>
                    {distanceInKM} kms
                  </Text>
                ) : null}
                {facility1ImageURL !== '' ? (
                  <Image
                    style={{width: 16, height: 16}}
                    resizeMode={'contain'}
                    source={{uri: facility1ImageURL}}
                  />
                ) : null}
                {facility2ImageURL !== '' ? (
                  <Image
                    style={{width: 16, height: 16, marginLeft: 5}}
                    resizeMode={'contain'}
                    source={{uri: facility2ImageURL}}
                  />
                ) : null}
                {facility3ImageURL !== '' ? (
                  <Image
                    style={{width: 16, height: 16, marginLeft: 5}}
                    resizeMode={'contain'}
                    source={{uri: facility3ImageURL}}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </CardView>
      </TouchableHighlight>
    );
  }

  onGymSelected(selectedIndex) {
    let selectedGym = this.state.gymList[selectedIndex];
    console.log('selected gym:::');
    console.log(selectedGym);

    let params = {};
    params[Constants.KEY_GYM_ID] = selectedGym[Constants.KEY_ID];
    params[Constants.KEY_GYM_NAME] = selectedGym[Constants.KEY_GYM_NAME];
    params[Constants.KEY_GYM_DISPLAY_LOCATION] =
      selectedGym[Constants.KEY_GYM_DISPLAY_LOCATION];
    params[Constants.KEY_PROFILE_IMAGE] =
      this.state.largeImageURL + '/' + selectedGym[Constants.KEY_PROFILE_IMAGE];
    params[Constants.KEY_COVER_IMAGE] =
      this.state.largeImageURL + '/' + selectedGym[Constants.KEY_COVER_IMAGE];
    params[Constants.KEY_GYM_MOBILE_PHONE] =
      selectedGym[Constants.KEY_GYM_MOBILE_PHONE];
    params[Constants.KEY_COUNTRY_ID] = '91';
    params[Constants.KEY_LATITUDE] = selectedGym[Constants.KEY_LATITUDE];
    params[Constants.KEY_LONGITUDE] = selectedGym[Constants.KEY_LONGITUDE];
    this.props.navigation.navigate('GymDetailsScreen', params);
  }

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };

  shareGymVale = () => {
    let title = 'Have you look this fitness application ?Download Now -';
    let referralURL =
      Constants.REFERRAL_APP_URL_PREFIX + 'm' + this.state.memberID;
    let shareOptions = {
      title: title,
      message: 'Have you look this fitness application ?Download Now -',
      url: referralURL,
      subject: title,
    };

    Share.open(shareOptions)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });
  };

  shareReferralURL() {
    let title = 'Sign Up in GymVale.com';
    let referralURL = Constants.REFERRAL_URL_PREFIX + 'rg' + this.state.gymID;
    let shareOptions = {
      title: title,
      message: 'Sign up in GymVale.com by using the link',
      url: referralURL,
      subject: title,
    };

    Share.open(shareOptions)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  button: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 3,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    lineHeight: 40,
    marginTop: 20,
  },
  tabTitle: {
    color: '#343434',
    fontSize: 15,
    fontWeight: '500',
    flexGrow: 1,
    textAlign: 'left',
  },
  closeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'cover',
    marginRight: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#162029',
    paddingHorizontal: 10,
    height: 40,
  },
  backIcon: {
    width: 11,
    height: 20,
    resizeMode: 'cover',
    marginRight: 10,
  },
  searchIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 20,
  },
  shareIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 20,
  },
  notificationIcon: {
    width: 13,
    height: 15,
    resizeMode: 'cover',
    marginRight: 20,
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
  titleBannerContainer: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleBanner: {
    width: 150,
    height: 21.5,
  },
  topInfoContainer: {
    width: '100%',
    height: 105,
    backgroundColor: '#162029',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchTextInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  memberInfoContainer: {
    padding: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberProfileImage: {
    width: 45,
    aspectRatio: 1,
    borderRadius: 22.5,
  },
  profileInfoView: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  profileNameText: {
    color: '#343434',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  membershipNameText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    color: '#343434',
    flexWrap: 'wrap',
  },
  cardViewStyle: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
});

const mapStateToprops = (state) => {
  return {
    allCitiesList: state.getAllCityReducer.allCity,
    Loading: state.getAllCityReducer.isLoading,
    Success: state.getAllCityReducer.success,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      FetchAllCity: fetchAllCity,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(GymSearchScreen);
