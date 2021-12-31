import React,{useEffect, useState} from 'react'

import {
  Text,
  FlatList,
  TextInput,
  View,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import * as globals from '../utils/globals';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {aboutcomment} from '../Redux/Actions/aboutCommentAction';



const MemberAboutScreen = ({aboutList,commentData,gymMemberManageID,willStopChildFlatListScrolling,dispatchComment}) => {
  const [gymID, setgymID] = useState('')
  const [comment, setcomment] = useState('')
  const [AboutList,setAboutlist] = useState(aboutList)
  const [active,setactive] = useState(false)
  
  // const [gymMemberManageID, setgymMemberManageID] = useState(gymMemberManageID)

  
  useEffect(() => {
   
    let gymId = '';
    // setlist(aboutList)

    // let aboutList = aboutList;
    // setAboutlist(abou/tList);
    
  let userInfo = globals.getSetting().userInfo;
  let body = userInfo[Constants.KEY_USER_DATA];
  let userType = body[Constants.KEY_USER_TYPE];
  if (userType === Constants.USER_TYPE_OWNER) {
    let gymData = userInfo[Constants.KEY_GYM_DATA];
    gymId = gymData[Constants.KEY_ID];
  } else if (userType === Constants.USER_TYPE_MEMBER) {
    let memberData = userInfo[Constants.KEY_MEMBER_DATA];
    memberData = memberData[0];
    gymId = memberData[Constants.KEY_GYM_ID];
  }

  // let aboutList = properties.aboutList;
  // let gymMemberManageID = gymMemberManageID;
  // let willStopChildFlatListScrolling =
    // properties.willStopChildFlatListScrolling;
    setgymID(gymId)
  // this.state = {
  //   gymMemberManageID: gymMemberManageID,
  //   gymID: gymID,
  //   aboutList: aboutList,
  //   isLoading: false,
  //   willStopChildFlatListScrolling: willStopChildFlatListScrolling,
  // };
  }, [])
  const onCommentChanged = (text) => {
    setcomment(text)
    // let aboutList = this.state.aboutList;
    // let aboutItem = aboutList[aboutList.length - 1];
    // aboutItem[Constants.KEY_RIGHT_VALUE] = text;
    // aboutList[aboutList.length-1] = aboutItem;
    // console.log('====================================');
    // console.log(text);
    // console.log('====================================');
   
    // let aboutList = aboutList;
    // let aboutItem = aboutList[aboutList.length - 1];
    // aboutItem[Constants.KEY_RIGHT_VALUE] = text;
    // aboutList[aboutList.length - 1] = aboutItem;
    // this.setState({
    //   aboutList: aboutList,
    // });
  };
  
  const saveComment = () => {
    console.log('run')
    // this.setState({
    //   isLoading: true,
    // });
  
    // let thisInstance = this;
    // let aboutLis = aboutList;
    // // console.log(aboutLis)
    // let aboutItem = aboutLis[aboutLis.length - 1];
    // let comment = aboutItem[Constants.KEY_RIGHT_VALUE];
    // let thisInstance = this;
    //     let aboutList = this.state.aboutList;
    //     let aboutItem = aboutList[aboutList.length - 1];
    //     let comment = aboutItem[Constants.KEY_RIGHT_VALUE];
  
    let data = new FormData();
    data.append(Constants.KEY_ABOUT_COMMENT, comment);
    data.append(Constants.KEY_GYM_MEMBER_MANAGE_ID, gymMemberManageID);
    data.append(Constants.KEY_GYM_ID, gymID);
  
    console.log("BODY:::");
    console.log(data);
    dispatchComment(data).then(() =>  {
      if (commentData.success) {
        let valid = commentData.data[Constants.KEY_VALID];
        if (valid) {
          console.log('==>',data)
          // thisInstance.setState({
          //   isLoading: false,
          // });
          return
        }
      } else {
        let message = 'Some error occurred. Please try agian.';
  
       
        Utils.showAlert('Error!', message);
      }
    });
  
   
  };
  
  const renderSeparator = () => {
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
  const renderItem= (item, index) => {
    console.log(item,'[[[[[[[[[[[[[[[[[')
    let leftText = item[Constants.KEY_LEFT_VALUE];
    let rightText = item[Constants.KEY_RIGHT_VALUE];
  
    if (leftText === Constants.KEY_ABOUT_COMMENT) {
      return (
        <>
        <TouchableHighlight>
          <View style={styles.aboutInfoRow}>
            <View style={styles.aboutInfoColumn}>
              
            </View>
           
          </View>
        </TouchableHighlight>
        <View style={styles.aboutInfoColumn}>
              <TextInput
              onKeyPress={() => {setactive(true)}}
                style={styles.inputText}
                placeholder={leftText}
                onChangeText={(text) => {onCommentChanged(text)}}
                value={!active ? rightText : comment}
                multiline
                // numberOfLines={5}
              />
              <TouchableOpacity
                onPress={() => saveComment()}
                style={{marginTop: 5}}>
                <View style={styles.saveButton}>
                  <Text
                    style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                    SAVE
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
        </>
      );
    }
  
    return (
      <TouchableHighlight>
        <View style={styles.aboutInfoRow}>
          <View style={styles.aboutInfoColumn}>
            <Text style={styles.leftText}>{leftText}</Text>
          </View>
          <View style={styles.aboutInfoColumn}>
            <Text style={styles.rightText}>{rightText}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FlatList
        style={{width: '100%'}}
        data={aboutList}
        keyExtractor={(item, index) => {
          return index + '';
        }}
        renderItem={({item, index}) => renderItem(item, index)}
        ItemSeparatorComponent={renderSeparator}
        // scrollEnabled={!state.willStopChildFlatListScrolling}
      />
      {/* {state.isLoading ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            size="large"
            color="#161a1e"
            style={{marginTop: 35}}
          />
        </View>
      ) : null} */}
    </View>
  );
}


const styles = StyleSheet.create({
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
  aboutInfoRow: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  aboutInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftText: {
    width: '100%',
    color: 'grey',
    fontSize: 14,
    textAlign: 'left',
  },
  rightText: {
    width: '100%',
    color: '#242424',
    fontSize: 14,
    textAlign: 'left',
    paddingLeft: 10,
  },
  inputText: {
    borderWidth: 1,
    borderColor: '#1d2b36',
    height:150,
    color: '#242424',
    fontSize: 14,
    width: '90%',
    textAlignVertical:'top'
  },
  saveButton: {
    width: 100,
    height: 35,
    backgroundColor: '#161a1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToprops = (state) => {
  return {
    commentData: state.aboutcommentReducer,
  };
};

const mapDispatchToprops = (dispatch) => {
  return bindActionCreators(
    {
      dispatchComment: aboutcomment,
    },
    dispatch,
  );
};
export default connect(mapStateToprops, mapDispatchToprops)(MemberAboutScreen);
