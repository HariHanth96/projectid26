import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    SafeAreaView, 
    ImageBackground 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ReactNativeModal from "react-native-modal";
import Toast from 'react-native-toast-message';

import SQLite from 'react-native-sqlite-storage';
import { updateBalance } from '../src/slices/bsaSlice';
const db = SQLite.openDatabase("bsa.db")

const StaffsPage = () => {
    const updatedBalance = useSelector((state) => state.user.balance)
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const [staffsData, setStaffsData] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [staffName, setStaffName] = useState('')
    const [staffPrice, setStaffPrice] = useState('')
    const [staffId, setStaffId] = useState(false)
    const [requiredSpace, setRequiredSpace] = useState('')
    const [requiredSpaceCode, setRequiredSpaceCode] = useState(0)

    useEffect(() => {
        getValues()
    }, [])


    const openBuyNowModal = (item) => {
        setStaffName(item.name)
        setStaffPrice(item.price)
        setStaffId(item.id)
        setRequiredSpace(item.required_space)
        setRequiredSpaceCode(item.min_buidling_lvl_code)
        setModalVisible(true)
    }

    const recomputeBalance = () => {
        let finalBalance = parseInt(updatedBalance) - parseInt(staffPrice)
        dispatch(updateBalance({ 'price': finalBalance, 'updateBalanceDB': true }))
    }

    const getValues = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM staff',
                    [],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setStaffsData(temp)
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


    const buyNow = () => {
        if (updatedBalance < staffPrice) {
            Toast.show({
                type: 'error',
                text1: 'Insufficient Balance.',
                autoHide: true,
                visibilityTime: 2000,
            });
        }
        else {
            try {
                db.transaction(tx => {
                    tx.executeSql(
                        'SELECT * FROM buildings WHERE is_buy = ? AND level_code >= ?;',
                        [1, requiredSpaceCode],
                        (_, { rows }) => {
                            if (rows.length <= 0) {
                                Toast.show({
                                    type: 'error',
                                    text1: `${requiredSpace} Required.`,
                                    autoHide: true,
                                    visibilityTime: 2000,
                                });
                            } else {
                                tx.executeSql(
                                    'SELECT * FROM staff WHERE is_buy = ?;',
                                    [1],
                                    (tx, results) => {
                                        let isStaffExist = false
                                        const len = results.rows.length;
                                        for (let i = 0; i < len; i++) {
                                            let row = results.rows.item(i);
                                            isStaffExist = staffId == row.id
                                            if (isStaffExist) break
                                        }
                                        if (isStaffExist) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'This variant staff is already in use.',
                                                autoHide: true,
                                                visibilityTime: 2000,
                                            });
                                        } else {
                                            tx.executeSql(
                                                'UPDATE staff SET is_buy = ? WHERE id = ?;',
                                                [1, staffId],
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
                                                    console.log('Error updating data:', error);
                                                }
                                            );
                                        }
                                    },

                                );


                            }
                        },
                        (tx, error) => {
                            console.log('Error fetching building:', error);
                        }
                    );
                })
            } catch {
                console.log("BuyNow Error")
            }
        }
        setModalVisible(false)
    }

    const goToback = () => {
        navigation.goBack()
    }

    const renderStaffsTemp = (data) => {
        return (
            <TouchableOpacity style={{ marginTop: 30, backgroundColor: '#49337d', padding: 10 }} key={data.id} onPress={() => openBuyNowModal(data)}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Text style={[styles.text, styles.h4, { width: "50%" }]}>{data.name}</Text>
                    <Text style={[styles.text, styles.h4, { width: "50%", textAlign: 'right' }]}>₹{data.price.toLocaleString()}/Month</Text>
                </View>
            </TouchableOpacity>
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
                            <Text style={[styles.text, styles.h3, { textAlign: 'center' }]}>Staff</Text>
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
                                    <View style={{ backgroundColor: '#2e306e', height: 280, borderTopStartRadius: 20, borderTopEndRadius: 20, position: 'relative' }}>
                                        <View style={{ margin: 10 }}>
                                            <View>
                                                <Text style={[styles.h2, { padding: 10, fontSize: 25, color: 'white' }]} numberOfLines={2}>{staffName}</Text>
                                                <Text style={[styles.h4, { padding: 10, color: 'white' }]}>₹{staffPrice.toLocaleString()}/Month</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.h3, { padding: 10, color: 'white' }]}>Required</Text>
                                                <Text style={[styles.h4, { padding: 10, paddingTop: 0, fontWeight: '500', color: 'white' }]}>{requiredSpace}.</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }} onPress={() => buyNow()}>
                                            <Text style={styles.buyNowButton}>Buy Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ReactNativeModal>
                                {
                                    staffsData.length ? (
                                        staffsData.map((data) => {
                                            return (
                                                <View key={data.id}>
                                                    {renderStaffsTemp(data)}
                                                    <View style={styles.separator} />
                                                </View>
                                            )
                                        })
                                    ) :
                                        (
                                            <Text style={styles.text}>No Staffs Found</Text>
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
    h5: {
        fontSize: 10,
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
})

export default StaffsPage