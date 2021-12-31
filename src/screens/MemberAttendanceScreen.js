import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import * as globals from '../utils/globals';
import {bindActionCreators} from 'redux';
import {fetchAllAttendance} from '../Redux/Actions/fetchAllAttendanceAction';
import {connect} from 'react-redux';

const numberOfDaysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

class MemberAttendanceScreen extends Component {
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
      memberID = properties.memberID;
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      let memberData = userInfo[Constants.KEY_MEMBER_DATA];
      memberData = memberData[0];
      memberID = memberData[Constants.KEY_MEMBER_ID];
      gymID = memberData[Constants.KEY_GYM_ID];
    }
    console.log('### Membership plans:::', membershipPlans);
    let membershipPlans = properties.membershipPlans;
    let membershipStartDate = '';
    for (let i = 0; i < membershipPlans.length; i++) {
      let membershipPlan = membershipPlans[i];
      let status = membershipPlan[Constants.KEY_STATUS];
      if (status === Constants.STATUS_ACTIVE) {
        membershipStartDate = membershipPlan[Constants.KEY_START_DATE];
      }
    }
    console.log('Membership Start Date:::' + membershipStartDate);
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;

    this.state = {
      gymID: gymID,
      memberID: memberID,
      currentYear: currentYear,
      currentMonth: currentMonth,
      attendanceData: {},
      currentMonthAttendance: [],
      markedDatesOfCurrentMonth: {},
      isFetchingList: true,
      isDataLoaded: false,
      willShowDisplayLoadingIndicatorOfCalendar: false,
      membershipPlans: membershipPlans,
      membershipStartDate: membershipStartDate,
    };
  }

  componentDidMount() {
    this.fetchMemberAttendance(
      this.state.memberID,
      this.state.currentYear,
      this.state.currentMonth,
    );
  }

  render() {
    return (
      <View style={[styles.mainContainer, {justifyContent: 'flex-start'}]}>
        {this.state.isDataLoaded === false ? (
          <View style={styles.mainContainer}>
            <TouchableOpacity
              onPress={() => {
                this.fetchMemberAttendance(
                  this.state.memberID,
                  this.state.currentYear,
                  this.state.currentMonth,
                );
              }}
              style={{width: '100%'}}>
              <Text style={styles.button}>Retry to fetch data</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Calendar
          // Initially visible month. Default = Date()
          //current={'2012-03-01'}
          // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
          //minDate={'2012-05-10'}
          // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
          //maxDate={new Date()}
          // Handler which gets executed on day press. Default = undefined
          onDayPress={(day) => {
            console.log('selected day', day);
          }}
          // Handler which gets executed on day long press. Default = undefined
          onDayLongPress={(day) => {
            console.log('selected day', day);
          }}
          // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
          monthFormat={'MMMM yyyy'}
          // Handler which gets executed when visible month changes in calendar. Default = undefined
          onMonthChange={(month) => {
            this.onMonthChanged(month);
          }}
          // Hide month navigation arrows. Default = false
          //hideArrows={true}
          // Replace default arrows with custom ones (direction can be 'left' or 'right')
          //renderArrow={(direction) => (<Arrow />)}
          // Do not show days of other months in month page. Default = false
          //hideExtraDays={true}
          // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
          // day from another month that is visible in calendar page. Default = false
          //disableMonthChange={true}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          //firstDay={1}
          // Hide day names. Default = false
          //hideDayNames={true}
          // Show week numbers to the left. Default = false
          //showWeekNumbers={true}
          // Handler which gets executed when press arrow icon left. It receive a callback can go back month
          onPressArrowLeft={(substractMonth) => substractMonth()}
          // Handler which gets executed when press arrow icon left. It receive a callback can go next month
          onPressArrowRight={(addMonth) => addMonth()}
          displayLoadingIndicator={
            this.state.willShowDisplayLoadingIndicatorOfCalendar
          }
          markedDates={this.state.markedDatesOfCurrentMonth}
          // Specify theme properties to override specific styles for calendar parts. Default = {}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#222222',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
            dayTextColor: '#222222',
            textDisabledColor: '#999999',
            dotColor: '#007ee5',
            selectedDotColor: '#ffffff',
            arrowColor: '#007ee5',
            monthTextColor: '#162029',
            indicatorColor: 'blue',
            textDayFontWeight: 'bold',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 16,
          }}
          style={{
            width: '100%',
            paddingHorizontal: 20,
          }}
        />
        <Text
          style={{
            marginVertical: 30,
            color: '#222222',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'left',
            width: '100%',
            paddingHorizontal: 20,
          }}>
          Attendance Summery
        </Text>
        <Text
          style={{
            color: '#222222',
            fontSize: 16,
            textAlign: 'left',
            width: '100%',
            paddingHorizontal: 20,
          }}>
          Present Days: {this.state.currentMonthAttendance.length}
        </Text>
        {this.state.isFetchingList ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color="#121619" />
          </View>
        ) : null}
      </View>
    );
  }

  fetchMemberAttendance(memberID, year, month) {
    this.setState({
      isFetchingList: true,
      isDataLoaded: false,
    });
    let thisInstance = this;

    let body =
      Constants.KEY_GYM_ID +
      '=' +
      this.state.gymID +
      '&' +
      Constants.KEY_MEMBER_ID +
      '=' +
      memberID +
      '&' +
      Constants.KEY_YEAR +
      '=' +
      year;

    console.log('Body:::');
    console.log(body);
    this.props.DispatchfetchAllAttendance(body);

    setTimeout(() => {
      if (this.props.FetchAllAttendancedata.success) {
        let valid = this.props.FetchAllAttendancedata.data[Constants.KEY_VALID];
        let body = null;
        if (valid) {
          body = this.props.FetchAllAttendancedata.data[Constants.KEY_BODY];
          body = body[0];
        }
        let attendanceData = thisInstance.state.attendanceData;
        attendanceData[year + ''] = body;

        let currentMonthAttendance = thisInstance.getAttendanceListOfMonth(
          attendanceData,
          year,
          month,
        );
        let markedDatesOfCurrentMonth =
          thisInstance.getMarkedDatesObjectFromAttendanceDates(
            currentMonthAttendance,
            year,
            month,
          );
        thisInstance.setState({
          attendanceData: attendanceData,
          currentMonthAttendance: currentMonthAttendance,
          markedDatesOfCurrentMonth: markedDatesOfCurrentMonth,
          willShowDisplayLoadingIndicatorOfCalendar: false,
          isFetchingList: false,
          isDataLoaded: true,
        });
      }
    }, 1200);
  }

  getAttendanceListOfMonth(attendanceData, year, month) {
    let currentMonthAttendance = [];
    let currentYearAttendanceData = attendanceData[year + ''];
    if (currentYearAttendanceData) {
      let monthKey = (month < 10 ? '0' : '') + month;
      let currentMonthAttendanceData = currentYearAttendanceData[monthKey];
      if (currentMonthAttendanceData && currentMonthAttendanceData.length > 0) {
        currentMonthAttendance = currentMonthAttendanceData.split(',');
      }
    }
    return currentMonthAttendance;
  }

  getMarkedDatesObjectFromAttendanceDates(attendanceDates, year, month) {
    let markedDatesOfCurrentMonth = {};

    let membershipStartDate = Date.parse(this.state.membershipStartDate);
    console.log(':::membershipStartDate:::');
    console.log(membershipStartDate);

    let dateObj = new Date();
    let currentMonth = dateObj.getUTCMonth() + 1; //months from 1-12
    let currentDay = dateObj.getUTCDate();
    let currentYear = dateObj.getUTCFullYear();
    if (currentYear > year || (currentYear === year && currentMonth >= month)) {
      const daysInMonth = numberOfDaysInMonth[month];
      let monthText = '';
      if (month < 10) {
        monthText = '0';
      }
      monthText += month;
      for (let i = 1; i <= daysInMonth; i++) {
        if (currentYear === year && currentMonth === month) {
          if (i > currentDay) {
            break;
          }
        }
        let day = '';
        if (i < 10) {
          day = '0';
        }
        day += i;
        let attendanceDateText = year + '-' + monthText + '-' + day;
        let attendanceDate = new Date(attendanceDateText);
        if (attendanceDate.getTime() >= membershipStartDate) {
          markedDatesOfCurrentMonth[attendanceDateText] = {
            dotColor: '#d12210',
            marked: true,
          };
        }
      }
    }

    for (let i = 0; i < attendanceDates.length; i++) {
      markedDatesOfCurrentMonth[attendanceDates[i]] = {
        dotColor: '#007ee5',
        marked: true,
      };
    }
    return markedDatesOfCurrentMonth;
  }

  onMonthChanged(changedData) {
    console.log('month changed', changedData);

    let year = changedData[Constants.KEY_YEAR];
    let month = changedData[Constants.KEY_MONTH];
    this.setState({
      willShowDisplayLoadingIndicatorOfCalendar: true,
      currentYear: year,
      currentMonth: month,
    });
    let attendanceData = this.state.attendanceData;
    console.log('attendanceData::');
    console.log(attendanceData);
    if (attendanceData['' + year] !== undefined) {
      let currentMonthAttendance = this.getAttendanceListOfMonth(
        attendanceData,
        year,
        month,
      );
      let markedDatesOfCurrentMonth =
        this.getMarkedDatesObjectFromAttendanceDates(
          currentMonthAttendance,
          year,
          month,
        );
      console.log('currentMonthAttendance:::');
      console.log(currentMonthAttendance);
      console.log('markedDatesOfCurrentMonth:::');
      console.log(markedDatesOfCurrentMonth);
      this.setState({
        currentMonthAttendance: currentMonthAttendance,
        markedDatesOfCurrentMonth: markedDatesOfCurrentMonth,
        willShowDisplayLoadingIndicatorOfCalendar: false,
      });
    } else {
      this.fetchMemberAttendance(this.state.memberID, year, month);
    }
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
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
});

const mapStateToprops = (state) => {
  return {
    FetchAllAttendancedata: state.fetchAllAttendanceReducer,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      DispatchfetchAllAttendance: fetchAllAttendance,
    },
    dispatch,
  );
}
export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(MemberAttendanceScreen);
