import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    SafeAreaView, 
    ImageBackground 
} from 'react-native';
import { useSelector } from 'react-redux';

import SQLite from 'react-native-sqlite-storage';
const db = SQLite.openDatabase("bsa.db")

const OwnPage = () => {
    const updatedBalance = useSelector((state) => state.user.balance)
    const [buildingData, setBuildingData] = useState([])
    const [staffData, setStaffData] = useState([])
    const [equipmentData, setEquipmentData] = useState([])
    const [loanData, setLoanData] = useState([])
    const [marketingData, setMarketingData] = useState([])
    const navigation = useNavigation()
    const ownData = [
        {
            id: 1,
            name: 'Loan',
            items: loanData
        },
        {
            id: 2,
            name: 'Marketing',
            items: marketingData,
        },
        {
            id: 3,
            name: 'Building',
            items: buildingData,
        },
        {
            id: 4,
            name: 'Staff',
            items: staffData
        },
        {
            id: 5,
            name: 'Equipments',
            items: equipmentData
        },
    ]

    useFocusEffect(
        useCallback(() => {
            getBuildingData()
            getStaffData()
            getEquipmentData()
            getLoanData()
            getMarketingData()
        }, [])
    );

    const getMarketingData = () => {
        try{
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM marketing WHERE is_buy = ?;',
                    [1],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setMarketingData(temp)
                    },
                    (tx, error) => {
                        console.log('Error fetching marketing:', error);
                    }
                )
            })
        } catch {
            console.log("getMarketingData error")
        }
    }

    const getLoanData = () => {
        try{
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM loan WHERE is_buy = ?;',
                    [1],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setLoanData(temp)
                    },
                    (tx, error) => {
                        console.log('Error fetching loan:', error);
                    }
                )
            })
        } catch {
            console.log("getLoanData error")
        }
    }


    const getEquipmentData = () => {
        try{
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM EquipmentItems WHERE is_buy = ?;',
                    [1],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setEquipmentData(temp)
                    },
                    (tx, error) => {
                        console.log('Error fetching Equiments Items:', error);
                    }
                )
            })
        } catch {
            console.log("getBuildingData error")
        }
    }

    const getBuildingData = () => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM buildings WHERE is_buy = ?;',
                    [1],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setBuildingData(temp)
                    },
                    (tx, error) => {
                        console.log('Error fetching building:', error);
                    }
                );
            })
        } catch {
            console.log("getBuildingData error")
        }
    }

    const getStaffData = () => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM staff WHERE is_buy = ?;',
                    [1],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setStaffData(temp)
                    },
                    (tx, error) => {
                        console.log('Error fetching building:', error);
                    }
                );
            })
        } catch {
            console.log("getStaffData error")
        }
    }

    const goToback = () => {
        navigation.goBack()
    }

    const renderItems = (item) => {
        return (
            <View key={item.id}  style={{padding:10, backgroundColor: '#49337d', marginTop:10}}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <Text style={[styles.text, styles.h4, { width: '50%' }]}>{item.name}</Text>
                    <Text style={[styles.text, styles.h4, { width: '20%' }]}>{item.qty} {item.qty && 'Qty'}</Text>
                    <Text style={[styles.text, styles.h4, { width: '30%', textAlign: 'right' }]}>₹{item.type == "marketing" ? (item.marketing_end_month * item.price).toLocaleString() : item.type == "loan" ? item.emi_price.toLocaleString() : item.price.toLocaleString()}{(item.type != "marketing" && !item.qty) && "/month"}{item.qty && '/unit'}</Text>
                </View>
            </View>
        )
    }

    const renderOwnPageTemp = (data) => {
        return (
            <View style={{ marginTop: 30 }} key={data.id}>
                <Text style={[styles.text, styles.h3, {textAlign:'center'}]}>{data.name}</Text>
                <View style={{ marginTop: 5 }}>
                    {
                        data.items.length ? (
                            data.items.map((item) => {
                                return (
                                    <View key={item.id}>
                                        {renderItems(item)}
                                        <View style={styles.separator} />
                                    </View>
                                )
                            })
                        ) : (
                            <Text style={styles.text}>Item Not Found.</Text>
                        )
                    }
                </View>
            </View>
        )
    }

    return (
         <ImageBackground
                    source={require('../assets/backgroundImage.jpg')}
                    style={styles.mainContainer}
                >
        <View style={styles.container}>
            <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1 }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ width: '35%' }} onPress={() => goToback()}>
                        <Text style={[styles.text, styles.button]}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: '65%' }}>
                        <Text style={[styles.text, styles.h3]}>Items Owned</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20, flex: 1 }}>
                    <Text style={[styles.text, styles.h4, { textAlign: 'right' }]}> ₹{updatedBalance.toLocaleString()}</Text>
                    <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            {
                                ownData.length && (staffData.length || buildingData.length || loanData.length || marketingData.length) ? (
                                        ownData.map((data) => {
                                            return (
                                                data.items.length > 0 ? (renderOwnPageTemp(data)) : ('')
                                            )
                                        })
                                ) :
                                    (
                                            <Text style={styles.text}>No Items Found</Text>
                                    )
                            }
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </View>
        </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    text: {
        color: 'white',
    },
    h1: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    h4: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    button: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#823894',
        padding: 10,
        borderRadius: 100,
        width: 90,
    },
    separator: {
        height: 1,
        backgroundColor: 'grey',
    },
})

export default OwnPage