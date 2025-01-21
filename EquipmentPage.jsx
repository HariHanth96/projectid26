import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import ReactNativeModal from "react-native-modal";
import Toast from 'react-native-toast-message';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions, 
    ScrollView, 
    SafeAreaView, 
    ImageBackground 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import SQLite from 'react-native-sqlite-storage';
import { updateBalance } from '../src/slices/bsaSlice';

const db = SQLite.openDatabase("bsa.db")

const screenWidth = Dimensions.get('window').width
const EquipmentPage = () => {
    const updatedBalance = useSelector((state) => state.user.balance)
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const [equipmentName, setEquipmentName] = useState('')
    const [equipmentPrice, setEquipmentPrice] = useState('')
    const [requiredStaff, setRequiredStaff] = useState('')
    const [requiredStaffLvlCode, setRequiredStaffLvlCode] = useState(0)
    const [qty, setQty] = useState(0)
    const [modalVisible, setModalVisible] = useState(false)
    const [equipmentItemId, setEquipmentItemId] = useState(0)
    const [equipmentData, setEquipmentData] = useState({})

    useEffect(() => {
        getValues()
    }, [])

    const getValues = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    `SELECT EquipmentItems.*, Equipments.name AS equipment_name
                    FROM EquipmentItems
                    JOIN Equipments ON EquipmentItems.equipment_id = Equipments.id;`,
                    [],
                    (tx, results) => {
                        const len = results.rows.length;
                        let equipmentData = {}
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            let item = {
                                "equipment_id": row.equipment_id,
                                "id": row.id,
                                "name": row.name,
                                "price": row.price,
                                "customer_rate": row.customer_rate,
                                "is_buy": row.is_buy,
                                "required_staff_lvl_code": row.required_staff_lvl_code,
                                "required_staff": row.required_staff,
                                "qty": row.qty,
                            }

                            if (!equipmentData[row.equipment_name]) {
                                equipmentData[row.equipment_name] = [];
                            }
                            equipmentData[row.equipment_name].push(item);
                        }
                        setEquipmentData(equipmentData)
                    },
                    (error) => {
                        console.log('Error getting data:', error);
                    }
                );
            });
        } catch {
            console.log("getValues Error ")
        }
    }

    const openBuyNowModal = (item) => {
        setEquipmentItemId(item.id)
        setEquipmentName(item.name)
        setEquipmentPrice(item.price)
        setRequiredStaff(item.required_staff)
        setRequiredStaffLvlCode(item.required_staff_lvl_code)
        setQty(item.qty)
        setModalVisible(true)
    }

    const goToback = () => {
        navigation.goBack()
    }

    const recomputeBalance = () => {
        let finalBalance = parseInt(updatedBalance) - parseInt(equipmentPrice)
        dispatch(updateBalance({ 'price': finalBalance, 'updateBalanceDB': true }))
    }

    const buyNow = () => {
        if (updatedBalance < equipmentPrice) {
            Toast.show({
                type: 'error',
                text1: 'Insufficient Balance.',
                autoHide: true,
                visibilityTime: 2000,
            });
        }
        else {
            db.transaction(function (tx) {
                tx.executeSql(
                    'SELECT * FROM staff WHERE is_buy = ? AND lvl_code >= ?;',
                    [1, requiredStaffLvlCode],
                    (_, { rows }) => {
                        if (rows.length <= 0) {
                            Toast.show({
                                type: 'error',
                                text1: `${requiredStaff} Required.`,
                                autoHide: true,
                                visibilityTime: 2000,
                            });
                        } else {
                            let tempQty = qty
                            tempQty += 1
                            for (let category in equipmentData) {
                                let items = equipmentData[category];
                                let currentItem = items.find(item => item.id === equipmentItemId);
                                if (currentItem) {
                                    Object.assign(currentItem, {qty:tempQty});
                                }
                            }
                            tx.executeSql(
                                'UPDATE EquipmentItems SET is_buy = ?, qty = ? WHERE id = ?;',
                                [1, tempQty, equipmentItemId],
                                (tx, results) => {
                                    recomputeBalance()
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Buy successfully',
                                        autoHide: true,
                                        visibilityTime: 2000,
                                    });
                                },
                                (error) => {
                                    console.log('Error getting data:', error);
                                }
                            )
                        }
                    }
                )
            })
        }
        setModalVisible(false)

    }

    const renderItems = (item) => {
        return (
            <TouchableOpacity key={item.id} onPress={() => openBuyNowModal(item)}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 10, padding: 10, backgroundColor: '#49337d', }}>
                    <Text style={[styles.text, styles.h4, { width: '50%' }]}>{item.name}</Text>
                    <Text style={[styles.text, styles.h4, { width: '50%', textAlign: 'right' }]}>₹{item.price.toLocaleString()}</Text>
                </View>
            </TouchableOpacity>

        )
    }

    const renderEquipmentTemp = (data) => {
        return (
            <View style={{ marginTop: 30 }} key={equipmentData[data][0].equipment_id}>
                <Text style={[styles.text, styles.h3, { textAlign: 'center' }]}>{data}</Text>
                <View style={{ marginTop: 5 }}>
                    {
                        equipmentData[data].length ? (
                            equipmentData[data].map((item) => {
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
                        <TouchableOpacity style={{ width: '33.3%' }} onPress={() => goToback()}>
                            <Text style={[styles.text, styles.button]}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '33.3%' }}>
                            <Text style={[styles.text, styles.h3, { textAlign: 'center' }]}>Equipments</Text>
                        </TouchableOpacity>
                        <Text style={{ width: '33.3%' }}></Text>
                    </View>
                    <View style={{ marginTop: 20, flex: 1 }}>
                        <Text style={[styles.text, styles.h4, { textAlign: 'right' }]}> ₹{updatedBalance.toLocaleString()}</Text>
                        <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
                            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                                <ReactNativeModal
                                    isVisible={modalVisible}
                                    onBackdropPress={() => setModalVisible(false)}
                                    onBackButtonPress={() => setModalVisible(false)}
                                    backdropTransitionOutTiming={1}
                                    style={{ justifyContent: 'flex-end', margin: 0 }}
                                >
                                    <View style={{ backgroundColor: '#2e306e', height: 270, borderTopStartRadius: 20, borderTopEndRadius: 20, position: 'relative' }}>
                                        <View style={{ margin: 10 }}>
                                            <View>
                                                <Text style={[styles.h2, { padding: 10, color: "white" }]} numberOfLines={1}>{equipmentName}</Text>
                                                <Text style={[styles.h3, { padding: 10, paddingTop: 0, color: "white" }]}>₹{equipmentPrice.toLocaleString()}</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.h3, { padding: 10, color: "white" }]}>Required</Text>
                                                <Text style={[styles.h4, { padding: 10, paddingTop: 0, color: "white" }]}>{requiredStaff}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }} onPress={() => buyNow()}>
                                            <Text style={styles.buyNowButton}>Buy Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ReactNativeModal>
                                {
                                    equipmentData ? (
                                        Object.keys(equipmentData).map((data) => {
                                            return (
                                                renderEquipmentTemp(data)
                                            )
                                        })
                                    ) :
                                        (
                                            <Text style={styles.text}>No Equipment Found</Text>
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
        fontSize: 15,
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
    buyNowButton: {
        backgroundColor: '#823894',
        color: 'white',
        textAlign: 'center',
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: 'grey',
    },
})

export default EquipmentPage