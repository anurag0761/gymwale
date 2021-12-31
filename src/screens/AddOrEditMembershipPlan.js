import React, { Component } from 'react';
import { Text, StatusBar, Image, View, Dimensions, StyleSheet, Alert, ActivityIndicator, TextInput
, TouchableOpacity, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, Button
, ScrollView, Switch } from 'react-native';

import RNPickerSelect from 'react-native-picker-select';
import ActionSheet from 'react-native-action-sheet';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const screenWidth = Dimensions.get("window").width;

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { connect } from 'react-redux';
import { addOrEditSubplanAction } from '../Redux/Actions/addOrEditSubplanAction';
import { bindActionCreators } from 'redux';

const membershipDurations = [
    {label:"1 Month", value:'1'},
    {label:"2 Months", value:'2'},
    {label:"3 Months", value:'3'},
    {label:"4 Months", value:'4'},
    {label:"5 Months", value:'5'},
    {label:"6 Months", value:'6'},
    {label:"7 Months", value:'7'},
    {label:"8 Months", value:'8'},
    {label:"9 Months", value:'9'},
    {label:"10 Months", value:'10'},
    {label:"11 Months", value:'11'},
    {label:"12 Months", value:'12'},
];

const installmentPeriods = [
    {label:"Weekly", value:'7'},
    {label:"Monthly", value:'30'},
    {label:"Quarterly", value:'90'},
    {label:"Every 6 months", value:'180'},
];

const discountTypes = [
    {label:"Percentage", value:'Percentage'},
    {label:"Rupees", value:'Rupees'},
];

class AddOrEditMembershipPlan extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let membershipPlan = properties.navigation.getParam(Constants.KEY_MEMBERSHIP_PLAN);
        
        let membershipPlanID = "";
        let isEditing = false;
        let name = "";
        let membershipDuration = "";
        let totalFee = "";
        let isInstallmentEnabled = false;
        let installmentPeriod = "";
        let numberOfInstallments = "";
        let feePerInstallment = "";
        let isTaxEnabled = false;
        let taxName = "";
        let taxValue = "";
        let isDiscountEnabled = false;
        let discountType = discountTypes[0].value;
        let discountAmount = "";
        if(membershipPlan) {
            console.log("Membership plan to edit:::");
            console.log(membershipPlan);
            isEditing = true;
            membershipPlanID = membershipPlan[Constants.KEY_ID];
            name = membershipPlan[Constants.KEY_NAME];
            membershipDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
            totalFee = membershipPlan[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
            isInstallmentEnabled = membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] === "yes" ? true : false;
            installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
            numberOfInstallments = membershipPlan[Constants.KEY_NUMBER_OF_INSTALLMENTS];
            feePerInstallment = membershipPlan[Constants.KEY_FEE_PER_INSTALLMENT];
            isTaxEnabled = membershipPlan[Constants.KEY_TAX_STATUS] === Constants.STATUS_ACTIVE ? true : false;
            taxName = membershipPlan[Constants.KEY_TAX_NAME];
            taxValue = membershipPlan[Constants.KEY_TAX_VALUE];
            isDiscountEnabled = membershipPlan[Constants.KEY_DISCOUNT_STATUS] === Constants.STATUS_ACTIVE ? true : false;
            discountType = membershipPlan[Constants.KEY_DISCOUNT_TYPE];
            discountAmount = membershipPlan[Constants.KEY_DISCOUNT_AMOUNT];
        }
        
        this.state = {
            isLoading: false,
            gymID: gymID,
            membershipPlanID:membershipPlanID,
            isEditing: isEditing,
            name: name,
            membershipDuration:membershipDuration,
            totalFee:totalFee,
            isInstallmentEnabled:isInstallmentEnabled,
            installmentPeriod:installmentPeriod,
            numberOfInstallments: numberOfInstallments,
            feePerInstallment:feePerInstallment,
            isTaxEnabled: isTaxEnabled,
            taxName:taxName,
            taxValue:taxValue,
            isDiscountEnabled:isDiscountEnabled,
            discountType:discountType,
            discountAmount:discountAmount,
            willScrollToEnd: false,
        }

        console.log("Current state:::");
        console.log(this.state);

    }
    

    componentDidMount() {
        
    
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    onNameChanged = (text) => {
        this.setState({
            name:text
        });
    }

    onMembershipDurationChanged(duration) {
        let numberOfInstallments = "";
        let feePerInstallment = "";
        if(this.state.totalFee.length > 0 && parseInt(this.state.totalFee) > 0 && this.state.installmentPeriod !== "" && duration !== "") {
            let totalFee = parseInt(this.state.totalFee);
            let totalDays = parseInt(duration)*30;
            let periodInt = parseInt(this.state.installmentPeriod);
            let installments = Math.ceil(totalDays/periodInt);
            let installmentFee = parseInt(totalFee/installments);

            numberOfInstallments = "" + installments;
            feePerInstallment = "" + installmentFee;
        }

        this.setState({
            membershipDuration:duration,
            numberOfInstallments: numberOfInstallments,
            feePerInstallment: feePerInstallment,
        });
    }

    onTotalFeeChanged = (text) => {
        let numberOfInstallments = "";
        let feePerInstallment = "";
        if(text.length > 0 && parseInt(text) > 0 && this.state.membershipDuration !== "" && this.state.installmentPeriod !== "" ) {
            let totalFee = parseInt(text);
            let totalDays = parseInt(this.state.membershipDuration)*30;
            let periodInt = parseInt(this.state.installmentPeriod);
            let installments = Math.ceil(totalDays/periodInt);
            let installmentFee = parseInt(totalFee/installments);

            numberOfInstallments = "" + installments;
            feePerInstallment = "" + installmentFee;
        }

        this.setState({
            totalFee: text,
            numberOfInstallments: numberOfInstallments,
            feePerInstallment: feePerInstallment,
        });
    }

    onToggleInstallmentEnabled = (value) => {

        this.setState({
            isInstallmentEnabled: value,
            installmentPeriod:'',
            numberOfInstallments:'',
            feePerInstallment:'',
            willScrollToEnd: value,
        });
    }

    onInstallmentPeriodChanged(period) {
        let numberOfInstallments = "";
        let feePerInstallment = "";
        if(this.state.totalFee.length > 0 && parseInt(this.state.totalFee) > 0 && this.state.membershipDuration !== "") {
            let totalFee = parseInt(this.state.totalFee);
            let totalDays = parseInt(this.state.membershipDuration)*30;
            let periodInt = parseInt(period);
            let installments = Math.ceil(totalDays/periodInt);
            let installmentFee = parseInt(totalFee/installments);

            numberOfInstallments = "" + installments;
            feePerInstallment = "" + installmentFee;
        }

        this.setState({
            installmentPeriod:period,
            numberOfInstallments: numberOfInstallments,
            feePerInstallment: feePerInstallment,
        });
    }

    onToggleTaxEnabled = (value) => {
        this.setState({
            isTaxEnabled: value,
            taxName:'',
            taxValue:'',
            willScrollToEnd: value,
        });
    }

    onTaxNameChanged = (text) => {
        this.setState({
            taxName: text
        });
    }

    onTaxValueChanged = (text) => {
        this.setState({
            taxValue: text
        });
    }

    onToggleDiscountEnabled = (value) => {
        this.setState({
            isDiscountEnabled: value,
            discountType:discountTypes[0].value,
            discountAmount:'',
            willScrollToEnd: value,
        });
    }

    onDiscountTypeChanged(type) {
        this.setState({
            discountType: type
        });
    }

    onDiscountAmountChanged = (text) => {
        this.setState({
            discountAmount: text
        });
    }

    saveMembershipPlan = () => {
        if(this.validateInformation() === false) {
            return;
        }
        this.addMembershipPlan();
    }

    validateInformation() {
        if(this.state.name.length === 0) {
            Utils.showAlert("", "Please enter Plan Name");
            return false;
        }

        if(this.state.membershipDuration.length === 0) {
            Utils.showAlert("", "Please select time duration");
            return false;
        }

        if(this.state.totalFee.length === 0) {
            Utils.showAlert("", "Please enter fees");
            return false;
        }
        
        if(this.state.isInstallmentEnabled) {
            if(this.state.installmentPeriod.length === 0) {
                Utils.showAlert("", "Please select installment period");
                return false;
            }
        }

        if(this.state.isTaxEnabled) {
            if(this.state.taxValue.length === 0) {
                Utils.showAlert("", "Please enter Tax Value");
                return false;
            }
        }

        if(this.state.isDiscountEnabled) {
            if(this.state.discountAmount.length === 0) {
                Utils.showAlert("", "Please enter Discount Amount");
                return false;
            }
        }

        return true;
    }

    addMembershipPlan() {

        let thisInstance = this;

        this.setState({
            isLoading: true,
        });
        /*
        let body = Constants.KEY_GYM_ID+'='+this.state.gymID
        +"&"+Constants.KEY_MEMBERSHIP_ID+"="+this.state.membershipPlanID
        +"&"+Constants.KEY_NAME+"="+this.state.name
        +"&"+Constants.KEY_MEMBERSHIP_DURATION+"="+this.state.membershipDuration
        +"&"+Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE+"="+this.state.totalFee
        +"&"+Constants.KEY_INSTALLMENT_ENABLED+"="+(this.state.isInstallmentEnabled?Constants.YES:Constants.NO)
        +"&"+Constants.KEY_INSTALLMENT_DURATION+"="+this.state.installmentPeriod
        +"&"+Constants.KEY_NUMBER_OF_INSTALLMENTS+"="+this.state.numberOfInstallments
        +"&"+Constants.KEY_FEE_PER_INSTALLMENT+"="+this.state.feePerInstallment
        +"&"+Constants.KEY_TAX_STATUS+"="+(this.state.isTaxEnabled?Constants.STATUS_ACTIVE:Constants.STATUS_INACTIVE)
        +"&"+Constants.KEY_TAX_NAME+"="+this.state.taxName
        +"&"+Constants.KEY_TAX_VALUE+"="+this.state.taxValue
        +"&"+Constants.KEY_DISCOUNT_STATUS+"="+(this.state.isDiscountEnabled?Constants.STATUS_ACTIVE:Constants.STATUS_INACTIVE)
        +"&"+Constants.KEY_DISCOUNT_TYPE+"="+this.state.discountType
        +"&"+Constants.KEY_DISCOUNT_AMOUNT+"="+this.state.discountAmount;
        */
       
        let data = new FormData();
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_MEMBERSHIP_ID, this.state.membershipPlanID);
        data.append(Constants.KEY_NAME, this.state.name);
        data.append(Constants.KEY_MEMBERSHIP_DURATION, this.state.membershipDuration);
        data.append(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, this.state.totalFee);
        data.append(Constants.KEY_INSTALLMENT_ENABLED, (this.state.isInstallmentEnabled?Constants.YES:Constants.NO));
        data.append(Constants.KEY_INSTALLMENT_DURATION, this.state.installmentPeriod);
        data.append(Constants.KEY_NUMBER_OF_INSTALLMENTS, this.state.numberOfInstallments);
        data.append(Constants.KEY_FEE_PER_INSTALLMENT, this.state.feePerInstallment);
        data.append(Constants.KEY_TAX_STATUS, this.state.isTaxEnabled?Constants.STATUS_ACTIVE:Constants.STATUS_INACTIVE);
        data.append(Constants.KEY_TAX_NAME, this.state.taxName);
        data.append(Constants.KEY_TAX_VALUE, this.state.taxValue);
        data.append(Constants.KEY_DISCOUNT_STATUS, this.state.isDiscountEnabled?Constants.STATUS_ACTIVE:Constants.STATUS_INACTIVE);
        data.append(Constants.KEY_DISCOUNT_TYPE, this.state.discountType);data.append(Constants.KEY_DISCOUNT_AMOUNT, this.state.discountAmount);

        let apiURL = Constants.API_URL_ADD_MEMBERSHIP_PLAN;
        if(this.state.membershipPlanID.length > 0) {
            apiURL = Constants.API_URL_UPDATE_MEMBERSHIP_PLAN;
        }
        this.props.addOrEditSubplanActionDispatch(apiURL,data).then(() => {
            if(this.props.Success)
        {
            this.showMembershipPlanSavedAlert()
        }else{
            Utils.showAlert("Some error occurred. Please try again.");
        }
        })

    }


    updateMembershipPlan() {

    }

    showMembershipPlanSavedAlert() {
        let thisInstance = this;
        Alert.alert(
            "Success", "Membership Plan saved successfully.",
            [
                { 
                    text: 'OK', 
                    onPress: () => {
                        thisInstance.goBack();
                    } 
                },
            ],
            { cancelable: false },
          );
    }
    
	render() {

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                
                <View
                    style={
                        { 
                            flex: 1,
                            backgroundColor: 'white',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }
                    }
                >
                    <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                        <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                    </View>
                    
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={this.goBack}
                        >
                            <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                        </TouchableOpacity>

                        <Text style={styles.tabTitle}>{this.state.isEditing? "Update Membership" : "Add Membership"}</Text>
                    </View>

                    <ScrollView 
                        style={{width:'100%', height:'100%'}}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ref={ref => (this.scrollRef = ref)}
                        onContentSizeChange={() => {
                            if(this.state.willScrollToEnd) {
                                this.setState({
                                    willScrollToEnd: false,
                                });
                                this.scrollRef.scrollToEnd();
                            }
                        }}
                    >
                        <View 
                            style={{width:'100%', justifyContent:'center', alignItems:'center', padding:20}}
                            onStartShouldSetResponder={() => true}
                        >
                            
                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Plan Name</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <TextInput 
                                    style={styles.inputText}
                                    placeholder={"Enter Plan Name"}
                                    onChangeText={this.onNameChanged}
                                    value={this.state.name}
                                />
                            </View>
                        
                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Time Duration</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <TouchableOpacity onPress={this.onSelectMembershipDurationButtonClicked}>
                                    <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                        <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.membershipDuration === "" ? "Select Membership Duration": (this.state.membershipDuration === "1" ? "1 Month": this.state.membershipDuration + ' Months')}</Text>
                                        <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                    </View>
                                </TouchableOpacity>
                                {/*
                                <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                    <RNPickerSelect
                                        onValueChange={(value) => {
                                            this.onMembershipDurationChanged(value);
                                        }}
                                        items={membershipDurations}
                                        value={this.state.membershipDuration}
                                        style={pickerSelectStyles}
                                        useNativeAndroidPickerStyle={false}
                                        placeholder={{
                                            label: 'Select Duration',
                                            value: null,
                                            color: '#1d2b36',
                                        }}
                                        placeholderTextColor={"#1d2b36"}
                                    />
                                </View>
                                */}
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Fees</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <TextInput 
                                    style={styles.inputText}
                                    placeholder={"Enter Total Fee"}
                                    onChangeText={this.onTotalFeeChanged}
                                    value={this.state.totalFee}
                                    keyboardType={"number-pad"}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={[styles.inputTitleText, {flexGrow:1, color:'#1d2b36'}]}>Installment Enabled</Text>
                                    <Switch
                                        onValueChange={this.onToggleInstallmentEnabled}
                                        value={this.state.isInstallmentEnabled}
                                        trackColor={"#162029"}
                                    />
                                </View>
                            </View>

                            {
                                this.state.isInstallmentEnabled ?
                                (
                                    <View style={{width:'100%'}}>
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Installment Period</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TouchableOpacity onPress={this.onSelectInstallmentPeriodButtonClicked}>
                                                <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                    <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.installmentPeriod === "" ? "Select Installment Period": Constants.installmentPeriodOptionByValue[this.state.installmentPeriod]}</Text>
                                                    <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                                </View>
                                            </TouchableOpacity>
                                            {/*
                                            <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                                <RNPickerSelect
                                                    onValueChange={(value) => {
                                                        this.onInstallmentPeriodChanged(value);
                                                    }}
                                                    items={installmentPeriods}
                                                    value={this.state.installmentPeriod}
                                                    style={pickerSelectStyles}
                                                    useNativeAndroidPickerStyle={false}
                                                    placeholder={{
                                                        label: 'Select Period',
                                                        value: null,
                                                        color: '#1d2b36',
                                                    }}
                                                    placeholderTextColor={"#1d2b36"}
                                                />
                                            </View>
                                            */}
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Number of Installments</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                value={this.state.numberOfInstallments}
                                                editable={false}
                                            />
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Fee per Installment</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                value={this.state.feePerInstallment}
                                                editable={false}
                                            />
                                        </View>
                                    </View>
                                    
                                )
                                 : null
                            }

                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={[styles.inputTitleText, {flexGrow:1, color:'#1d2b36'}]}>Enable Tax</Text>
                                    <Switch
                                        onValueChange={this.onToggleTaxEnabled}
                                        value={this.state.isTaxEnabled}
                                        trackColor={"#162029"}
                                    />
                                </View>
                            </View>

                            {
                                this.state.isTaxEnabled ?
                                (
                                    <View style={{width:'100%'}}>
                                        
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Tax Name</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                placeholder={"Eg. GST"}
                                                onChangeText={this.onTaxNameChanged}
                                                value={this.state.taxName}
                                            />
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Tax Value</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                placeholder={"Enter Value in % Eg. 15"}
                                                onChangeText={this.onTaxValueChanged}
                                                value={this.state.taxValue}
                                                keyboardType={"number-pad"}
                                            />
                                        </View>
                                    </View>
                                    
                                )
                                 : null
                            }

                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={[styles.inputTitleText, {flexGrow:1, color:'#1d2b36'}]}>Enable Discount</Text>
                                    <Switch
                                        onValueChange={this.onToggleDiscountEnabled}
                                        value={this.state.isDiscountEnabled}
                                        trackColor={"#162029"}
                                    />
                                </View>
                            </View>

                            {
                                this.state.isDiscountEnabled ?
                                (
                                    <View style={{width:'100%'}}>
                                        
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Discount Type</Text>
                                            </View>
                                            <TouchableOpacity onPress={this.onSelectDiscountTypeButtonClicked}>
                                                <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                                    <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.discountType === "" ? "Select Discount Type": this.state.discountType}</Text>
                                                    <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                                </View>
                                            </TouchableOpacity>
                                            {/*
                                            <RNPickerSelect
                                                onValueChange={(value) => {
                                                    this.onDiscountTypeChanged(value);
                                                }}
                                                items={discountTypes}
                                                value={this.state.discountType}
                                                style={pickerSelectStyles}
                                                useNativeAndroidPickerStyle={false}
                                                placeholder={{}}
                                                placeholderTextColor={"#1d2b36"}
                                            />
                                            */}
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>Discount Amount</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.inputText}
                                                placeholder={this.state.discountType === Constants.DISCOUNT_TYPE_PERCENTAGE 
                                                    ? "Enter Value in % - Eg. 20": "Enter Value - Eg. 50"}
                                                onChangeText={this.onDiscountAmountChanged}
                                                value={this.state.discountAmount}
                                                keyboardType={"number-pad"}
                                            />
                                        </View>
                                    </View>
                                    
                                )
                                 : null
                            }
                        </View>
                    </ScrollView>
                    <TouchableOpacity
                        style={{width:'100%'}}
                        onPress={this.saveMembershipPlan}
                    >
                        <View style={styles.saveButtonContainer}>
                            <Text style={styles.saveButtonText}>SAVE</Text>
                        </View>
                    </TouchableOpacity>
                    {
                        this.props.Loading ? (
                            <View style={styles.activityIndicatorContainer}>
                                <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                            </View>
                        ): null
                    }
                </View>
                
            </TouchableWithoutFeedback>
			
		);
    }

    onSelectMembershipDurationButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Membership Duration',
            options: (Platform.OS == 'ios') ? Constants.membershipDurationOptionsIOS : Constants.membershipDurationOptionsAndroid,
            cancelButtonIndex: Constants.membershipDurationOptionsIOS.length-1,
            destructiveButtonIndex: Constants.membershipDurationOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < Constants.membershipDurationOptionsAndroid.length) {
                this.onMembershipDurationOptionSelected(buttonIndex);
            }
        });
    }

    onMembershipDurationOptionSelected(index) {
        let durationOption = Constants.membershipDurationOptionsIOS[index];
        let duration = Constants.membershipDurationValues[durationOption];
        
        let numberOfInstallments = "";
        let feePerInstallment = "";
        if(this.state.totalFee.length > 0 && parseInt(this.state.totalFee) > 0 && this.state.installmentPeriod !== "" && duration !== "") {
            let totalFee = parseInt(this.state.totalFee);
            let totalDays = parseInt(duration)*30;
            let periodInt = parseInt(this.state.installmentPeriod);
            let installments = Math.ceil(totalDays/periodInt);
            let installmentFee = parseInt(totalFee/installments);

            numberOfInstallments = "" + installments;
            feePerInstallment = "" + installmentFee;
        }

        this.setState({
            membershipDuration:duration,
            numberOfInstallments: numberOfInstallments,
            feePerInstallment: feePerInstallment,
        });
    }

    onSelectInstallmentPeriodButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Installment Period',
            options: (Platform.OS == 'ios') ? Constants.installmentPeriodOptionsIOS : Constants.installmentPeriodOptionsAndroid,
            cancelButtonIndex: Constants.installmentPeriodOptionsIOS.length-1,
            destructiveButtonIndex: Constants.installmentPeriodOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < Constants.installmentPeriodOptionsAndroid.length) {
                this.onInstallmentPeriodOptionSelected(buttonIndex);
            }
        });
    }

    onInstallmentPeriodOptionSelected(index) {
        let installmentPeriodOption = Constants.installmentPeriodOptionsIOS[index];
        let period = Constants.installmentPeriodValues[installmentPeriodOption];
        
        let numberOfInstallments = "";
        let feePerInstallment = "";
        if(this.state.totalFee.length > 0 && parseInt(this.state.totalFee) > 0 && this.state.membershipDuration !== "") {
            let totalFee = parseInt(this.state.totalFee);
            let totalDays = parseInt(this.state.membershipDuration)*30;
            let periodInt = parseInt(period);
            let installments = Math.ceil(totalDays/periodInt);
            let installmentFee = parseInt(totalFee/installments);

            numberOfInstallments = "" + installments;
            feePerInstallment = "" + installmentFee;
        }

        this.setState({
            installmentPeriod:period,
            numberOfInstallments: numberOfInstallments,
            feePerInstallment: feePerInstallment,
        });
        
    }

    onSelectDiscountTypeButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Discount Type',
            options: (Platform.OS == 'ios') ? Constants.discountTypeOptionsIOS : Constants.discountTypeOptionsAndroid,
            cancelButtonIndex: Constants.discountTypeOptionsIOS.length-1,
            destructiveButtonIndex: Constants.discountTypeOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < Constants.discountTypeOptionsAndroid.length) {
                this.onDiscountTypeOptionSelected(buttonIndex);
            }
        });
    }

    onDiscountTypeOptionSelected(index) {
        let discountTypeOption = Constants.discountTypeOptionsIOS[index];
        let discountType = Constants.discountTypeValues[discountTypeOption];
        
        this.setState({
            discountType: discountType
        });
        
    }
}

const styles = StyleSheet.create({
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        padding:15,
        height:40,
    },
    closeButton: {
        color:'#194164',
        textAlign:'center',
        textAlignVertical:'center',
        fontSize:24,
        fontWeight:'bold',
    },
    titleText: {
        color:'#194164',
        textAlign:'left',
        textAlignVertical:'center',
        fontSize:20,
        fontWeight:'bold',
        flexGrow:1,
        marginLeft:10,
    },
    profileImageContainer: {
        width:75,
        aspectRatio:1,
    },
    profileImage: {
        width:75,
        aspectRatio:1,
        borderRadius:37.5,
        borderWidth:StyleSheet.hairlineWidth,
        borderColor:'black',
    },
    cameraButtonContainer: {
        position:'absolute',
        top:21,
        right:-16.5,
    },
    cameraButton: {
        width:33,
        height:33,
        backgroundColor:'transparent',
    },
    inputContainer: {
        width:'100%',
        marginTop:15,
        justifyContent:'flex-start',
        alignItems:'center',
    },
    inputTitleContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
    },
    inputTitleText: {
        color:'#979797',
        fontSize:16,
    }, 
    requiredTitleText:{
        color:'#d83110',
        fontSize:16,
        fontWeight:'bold',
        marginLeft:5,
    }, 
    inputText: {
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#1d2b36',
        color:'#1d2b36',
        fontSize:16,
        width:'100%',
    },
    saveButtonContainer: {
        marginTop:15,
        width:'100%',
        backgroundColor:'#162029',
        height:40,
        justifyContent:'center',
        alignItems:'center'
    },
    saveButtonText: {
        color:'white',
        fontSize:22,
    },
    closeIcon: {
        width:16,
        height:16,
        resizeMode:'cover',
        marginRight: 10,
    },
    tabTitle: {
        color:'#202020',
        fontSize:14,
        flexGrow:1,
        fontWeight:'bold',
        textAlign:'left',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%',
        borderBottomWidth:2,
        borderColor:'#162029',
    },
    inputAndroid: {
        paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%',
        borderBottomWidth:2,
        borderColor:'#162029',
    },
  });
  const mapStateToProps = (state) => {
      return (
            {
                Loading:state.addOrEditsupPlanReducer.isLoading,
                Success:state.addOrEditsupPlanReducer.success
            }
      )
  }
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        
        addOrEditSubplanActionDispatch: addOrEditSubplanAction,
      },
      dispatch
    );
  }

export default connect(mapStateToProps,mapDispatchToProps) (AddOrEditMembershipPlan);
