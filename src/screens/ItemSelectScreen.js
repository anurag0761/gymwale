import React, { Component } from 'react';
import { Text, TouchableHighlight, Image, View, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

import * as Constants from '../utils/Constants';


class ItemSelectScreen extends Component {


    constructor(properties) {
        super(properties);

        let itemList = properties.navigation.getParam(Constants.KEY_ITEM_LIST);
        let propertyToShowAsLabel = properties.navigation.getParam(Constants.KEY_PROPERTY_TO_SHOW_AS_LABEL);
        let onItemSelected = properties.navigation.getParam(Constants.KEY_ON_ITEM_SELECTED);
console.log('--------------->',itemList)
        this.state = {
            itemList: itemList,
            propertyToShowAsLabel: propertyToShowAsLabel,
            filteredItemList: itemList,
            searchText: '',
            onItemSelected: onItemSelected,
        };
    }

	render() {

        return (
            <View style={{flex:1}}>
                <View style={[styles.headerContainer, {backgroundColor:'white'}]}>
                    <TouchableOpacity
                        onPress={this.goBack}
                    >
                        <Image style={styles.backIcon} source={require('../../assets/images/back_arrow.png')}/>
                    </TouchableOpacity>
                    <Image style={styles.searchIcon} source={require('../../assets/images/search_icon.png')}/>
                    <TextInput
                        autoCorrect={false}
                        style={styles.searchTextInput}
                        onChangeText={this.onSearchTextChanged}
                        value={this.state.searchText}
                        placeholder={"Search Here"}
                        enablesReturnKeyAutomatically
                        returnKeyType={"search"}
                        onSubmitEditing={this.onSearchTextChanged}
                    />
                </View>
                <FlatList
                    style={{ width: "100%"}}
                    data={this.state.filteredItemList}
                    keyExtractor={(item, index) => {
                        return index+"";
                    }}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    ItemSeparatorComponent={this.renderSeparator}
                />
            </View>
		);
    }

    onSearchTextChanged = (text) => {
        this.filterItemsBySearchText(text);
    };

    renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "#d6d6d6",
            }}
          />
        );
      };
    
    renderItem(item, index) {
        
        let itemLabel = item[this.state.propertyToShowAsLabel];

        return(
            <TouchableHighlight
                onPress={()=> {
                    this.onItemSelected(item);
                }}
            >
                <View style={{
                    width:'100%',
                    paddingHorizontal:20,
                    paddingVertical: 5,
                    justifyContent: 'center',
                    alignItems:'center',
                }}>
                    <Text style={{
                        width:'100%',
                        textAlign:'left',
                        fontSize: 20,
                        fontWeight:'bold',
                        color:'black',
                    }}>{itemLabel}</Text>
                </View>
            </TouchableHighlight>
            
        );
    }

    onItemSelected(item) {
        this.state.onItemSelected(item);
        this.goBack();
    }
    
    goBack = () => {
        this.props.navigation.pop();
    }

    filterItemsBySearchText(searchText) {
        let filteredItemList = [];
        let itemList = this.state.itemList;
        for(let i = 0; i < itemList.length; i++) {
            let item = itemList[i];
            if(item[this.state.propertyToShowAsLabel].includes(searchText)) {
                filteredItemList.push(item);
            }
        }
        
        this.setState({
            filteredItemList: filteredItemList,
            searchText: searchText,
        })
    }
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        height:44,
        backgroundColor:'#161a1e',
        paddingHorizontal: 10,
    },
    tabTitle: {
        color:'white',
        fontSize:20,
        fontWeight:'bold',
        flexGrow:1,
        textAlign:'left',
    },
    backIcon: {
        width:9,
        height:16,
        resizeMode:'cover',
        marginRight:10,
    },
    searchTextInput: {
        flexGrow:1, 
        textAlign:'left', 
        color:'#41464c',
    },
    searchIcon: {
        width:13,
        height:14,
        resizeMode:'cover',
        marginRight:20,
    },
    sortIcon: {
        width:22,
        height:18,
        resizeMode:'cover',
        marginRight:20,
    },
    shareIcon: {
        width:13,
        height:14,
        resizeMode:'cover',
        marginRight:20,
    },
    notificationIcon: {
        width:13,
        height:15,
        resizeMode:'cover',
        marginRight:20,
    },
});

export default ItemSelectScreen;
