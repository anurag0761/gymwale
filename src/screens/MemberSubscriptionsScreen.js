import React, { Component } from 'react';
import { Text, View, Linking, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

import CardView from 'react-native-rn-cardview';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';


class MemberSubscriptionsScreen extends Component {

    constructor(properties) {
        super(properties);
        console.log('===========hyber=========================');
        console.log(properties.aboutList);
        console.log('==============hyber======================');

        let gymID = "";
        
        let userInfo = globals.getSetting().userInfo;
        let body = userInfo[Constants.KEY_USER_DATA];
        let userType = body[Constants.KEY_USER_TYPE];
        if(userType === Constants.USER_TYPE_OWNER) {
            let gymData = userInfo[Constants.KEY_GYM_DATA];
            gymID = gymData[Constants.KEY_ID];
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            let memberData = userInfo[Constants.KEY_MEMBER_DATA];
            memberData = memberData[0];
            gymID = memberData[Constants.KEY_GYM_ID];
        }

        let memberID = properties.memberID;
        let membershipPlans = properties.membershipPlans;
        let willStopChildFlatListScrolling = properties.willStopChildFlatListScrolling;
        this.state = {
            gymID: gymID,
            memberID: memberID,
            membershipPlans: membershipPlans,
            willStopChildFlatListScrolling: willStopChildFlatListScrolling,
        }

    }

	render() {

        return (
			<View style={styles.mainContainer}>
				<FlatList
                    style={{ width: "100%", paddingHorizontal:10}}
                    data={this.state.membershipPlans}
                    keyExtractor={(item, index) => {
                        return "member_subscription_"+index+"";
                    }}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    onEndReached={()=>{
                        this.props.onEndReachedOfSubscriptionPage();
                    }}
                    scrollEnabled={!this.state.willStopChildFlatListScrolling}
                />
			</View>
		);
    }

    renderItem(item, index) {
        let membershipPlan = item;
        let gymID = membershipPlan[Constants.KEY_GYM_ID];
        let gymName = membershipPlan[Constants.KEY_GYM_NAME];
        let name = membershipPlan[Constants.KEY_MEMBERSHIP_NAME];
        let duration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
        let totalFee = membershipPlan[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
        let totalFeeWithTaxAndDiscount = membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
        if(totalFeeWithTaxAndDiscount === "") {
            totalFeeWithTaxAndDiscount = totalFee;
        }
        let startDate = membershipPlan[Constants.KEY_START_DATE];
        let endDate = membershipPlan[Constants.KEY_END_DATE];

        let remainingAttendance = "";
        if(membershipPlan[Constants.KEY_REMAINING_ATTENDANCE]) {
            remainingAttendance = membershipPlan[Constants.KEY_REMAINING_ATTENDANCE];
        }

        let remainingAmount = "0";

        let status = membershipPlan[Constants.KEY_STATUS];
        let statusColor = "#3fd458";
        let colorCode = "green";
        if(status === Constants.STATUS_INACTIVE) {
            colorCode = "red";
            statusColor = "red";
        }

        let totalPaid = 0;
        let paymentDetails = membershipPlan[Constants.KEY_PAYMENT_DETAILS];
        let paymentDetailRows = [];
        for(let i = 0; i < paymentDetails.length; i++) {
            let paymentDetail = paymentDetails[i];
            let date = paymentDetail[Constants.KEY_DATE];
            let paidAmount = parseInt(paymentDetail[Constants.KEY_AMOUNT]);
            totalPaid += paidAmount;
            let paymentDetailView = (
                <View 
                    style={[styles.planTitleRow, {marginTop: 2, justifyContent:'space-between'}]}
                    key={"payment_detail_"+i}
                >
                    <View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                        <Text style={[styles.leftText, {fontSize:15, fontWeight:'bold'}]}>Paid Amount</Text>
                        <Text style={[styles.leftText, {fontSize:13}]}> {date}</Text>
                    </View>
                    <Text style={[styles.rightText, {fontSize:15, fontWeight:'bold'}]}>{"₹ " + paidAmount}</Text>
                </View>
            );
            paymentDetailRows.push(paymentDetailView);
        }

        let remainingAmountNumber = parseInt(totalFeeWithTaxAndDiscount) - totalPaid;
        if(remainingAmountNumber < 0) {
            remainingAmountNumber = 0;
        }
        /*
        if(status === Constants.STATUS_INACTIVE) {
            remainingAmountNumber = 0;
        }
        */

        remainingAmount = remainingAmountNumber + ".00";

        let memberMembershipID = membershipPlan[Constants.KEY_MEMBER_MEMBERSHIP_ID];
        
        return(
            <CardView 
                cardElevation={4}
                maxCardElevation={4}
                radius={10}
                backgroundColor={'#ffffff'}
                style={styles.cardViewStyle}
            >
                <View style={styles.infoContainer}>
                    <View style={[styles.planTitleRow, {paddingRight:10}]}>
                        <View style={[styles.colorBar, {backgroundColor:colorCode}]} />
                        <Text style={styles.planTitleText}>{gymName}</Text>
                        <TouchableOpacity
                            onPress={() => this.downloadInvoiceWithMemberMembershipID(memberMembershipID)}
                            style={{marginRight:10,}}
                        >
                            <View style={styles.invoiceButton}>
                                <Text style={styles.invoiceButtonText}>Invoice</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.planTitleRow}>
                        <Text style={[styles.planDurationText, {color:"#202020", fontSize:12}]}>{name}</Text>
                        <Text style={[ styles.planFeeText, {color:statusColor, fontSize:12, textTransform:'capitalize'}]}>{status}</Text>
                    </View>
                    <View style={styles.planTitleRow}>
                        <Text style={styles.planDurationText}>{duration === '1' ? "1 month" : duration + " months"}</Text>
                        <Text style={styles.planFeeText}>{"₹ " + totalFeeWithTaxAndDiscount}</Text>
                    </View>
                    <View
                        style={{
                            paddingHorizontal:20,
                            justifyContent:'center',
                            alignItems:'center',
                            width:'100%',
                            marginTop: 10,
                            marginRight:10,
                        }}
                    >
                        <View style={{width:'100%', height:1, backgroundColor:'grey'}} />
                        <View style={[styles.planTitleRow, {marginTop: 10, justifyContent:'space-between'}]}>
                            <Text style={[styles.leftText, {fontSize:15, fontWeight:'bold'}]}>Start Date</Text>
                            <Text style={[styles.rightText, {fontSize:15, fontWeight:'bold'}]}>End Date</Text>
                        </View>
                        <View style={[styles.planTitleRow, {marginTop: 2, justifyContent:'space-between', marginBottom:10,}]}>
                            <Text style={[styles.leftText, {fontSize:13}]}>{startDate}</Text>
                            <Text style={[styles.rightText, {fontSize:13}]}>{endDate}</Text>
                        </View>
                        {paymentDetailRows}
                        {
                            remainingAttendance.length > 0 ? (
                                <View style={[styles.planTitleRow, {marginTop: 5, justifyContent:'space-between'}]}>
                                    <Text style={[styles.leftText, {fontSize:15, fontWeight:'bold'}]}>Remaining Attendance</Text>
                                    <Text style={[styles.rightText, {fontSize:15, fontWeight:'bold'}]}>{remainingAttendance}</Text>
                                </View>
                            ) : null
                        }
                        <View style={[styles.planTitleRow, {marginTop: 5, justifyContent:'space-between'}]}>
                            <Text style={[styles.leftText, {fontSize:15, fontWeight:'bold'}]}>Remaining Amount</Text>
                            <Text style={[styles.rightText, {fontSize:15, fontWeight:'bold'}]}>{"₹ " + remainingAmount}</Text>
                        </View>
                    </View>
                    
                    
                </View>                
            </CardView>
        );
    }

    downloadInvoiceWithMemberMembershipID(memberMembershipID) {
        let url = "https://gymvale.com/index.php/invoice-sample/"+memberMembershipID;
        console.log("URL:::"+ url);
        Linking.openURL(url);
    }
    
}

const styles = StyleSheet.create({
    mainContainer: {
        width:'100%',
        height:'100%',
        backgroundColor:'white',
        justifyContent:'flex-start',
        alignItems:'center',
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
        padding:10,
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
    },
    memberProfileImage: {
        width:45,
        aspectRatio:1,
        borderRadius:22.5,
    },
    profileInfoView: {
        justifyContent:'center',
        alignItems:'flex-start',
        flexGrow:1,
        paddingHorizontal:10,
    },
    profileNameText: {
        color:'black',
        fontSize:20,
        fontWeight:'bold',
        width:'100%',
        textAlign:'left',
    },
    membershipStatusText: {
        fontSize:16,
        width:'100%',
        textAlign:'left',
    },
    moreIcon: {
        width:5,
        height:22.5,
    },
    addButtonBackground: {
        width:40,
        height:40,
        backgroundColor:'#3fd458',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        right:20,
        bottom:20,
        borderRadius:20,
    },
    addButtonImage: {
        width:20.5,
        height:21
    },
    cardViewStyle: {
        width:'100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'center',
        marginVertical:5,
    },
    infoContainer: {
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white',
        paddingVertical: 5,
    },
    planTitleRow: {
        width:'100%',
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
    },
    colorBar: {
        width:4,
        borderRadius:2,
        height:'100%',
    },
    planTitleText: {
        flex:1,
        marginLeft:10,
        color:'#202020',
        fontSize:20,
        fontWeight:'bold',
        textAlign:'left',
        flexWrap:'wrap',
    },
    installmentStatus: {
        fontSize:16,
        textAlign:'right',
        marginRight:24,
    },
    planDurationText: {
        color:'#202020',
        fontSize:18,
        textAlign:'left',
        flexGrow:1,
        marginLeft:14,
    },
    planFeeText: {
        color:'#202020',
        fontSize:18,
        textAlign:'right',
        marginRight:24,
        fontWeight:'bold',
    },
    buttonContainer: {
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        marginVertical:5,
    },
    buttonStyle: {
        width:80,
        height:30,
        borderColor:'rgba(32,32,32,0.8)',
        borderWidth:1,
        borderRadius:5,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:10,
        marginRight:10,
    },
    nextButton: {
        width: '100%',
        height:35,
        backgroundColor:'#2c9fc9',
        justifyContent:'center',
        alignItems:'center',
    },
    invoiceButton: {
        width:80,
        height:20,
        backgroundColor:'red',
        borderRadius: 7,
        justifyContent:'center',
        alignItems:'center',
    },
    invoiceButtonText: {
        color:'white',
        fontSize: 14,
        textTransform:'uppercase',
        textAlign:'center',
    },
    leftText: {
        color:'#202020',
        fontSize:18,
        textAlign:'left',
    },
    rightText: {
        color:'#202020',
        fontSize:18,
        textAlign:'right',
    },
});

export default MemberSubscriptionsScreen;
