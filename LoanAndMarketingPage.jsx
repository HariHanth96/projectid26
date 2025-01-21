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
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Slider from '@react-native-community/slider';
import ReactNativeModal from "react-native-modal";
import SQLite from 'react-native-sqlite-storage';
import { updateBalance } from '../src/slices/bsaSlice';

const db = SQLite.openDatabase("bsa.db")

const LoanAndMarketingPage = () => {
    const updatedBalance = useSelector((state) => state.user.balance)
    const dispatch = useDispatch()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalName, setModalName] = useState(false)
    const [loanPrice, setLoanPrice] = useState(false)
    const [ID, setId] = useState(false)
    const [programType, setProgramType] = useState('')
    const [sliderState, setSliderState] = useState(0)
    const [perMonthPrice, setPerMonthPrice] = useState(0)
    const [loanData, setLoanData] = useState([])
    const [marketingData, setMarketingData] = useState([])
    const [roi, setRoi] = useState(0)
    const [price, setPrice] = useState(0)
    const [marketingPrice, setMarketingPrice] = useState(0)
    const [requiredData, setRequiredData] = useState(0)
    const navigation = useNavigation()
    const equipmentData = [
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
    ]

    useFocusEffect(
        useCallback(() => {
            getLoanData()
            getMarketingData()
        }, [])
    );

    const getLoanData = () => {
        try {
            db.transaction(function (tx) {
                tx.executeSql(
                    `SELECT * FROM loan`,
                    [],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setLoanData(temp)
                    }
                )
            })
        } catch {
            console.log("getLoanData error")
        }
    }

    const getMarketingData = () => {
        try {
            db.transaction(function (tx) {
                tx.executeSql(
                    `SELECT * FROM marketing`,
                    [],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setMarketingData(temp)
                    }
                )
            })
        } catch {
            console.log("getMarketingData error")
        }
    }

    const goToback = () => {
        navigation.goBack()
    }

    const openApplyModal = (item) => {
        setModalName(item.name)
        if (item.type == "loan") {
            setLoanPrice(item.price)
            setRoi(item.roi)
        } else {
            setRequiredData(item.required_staff)
        }
        setId(item.id)
        setPrice(item.price)
        setProgramType(item.type)
        setModalVisible(true)
        onSliderValueChange(0)
    }

    const calculateEMI = (loanAmount, interestRate, loanTenure) => {
        const principal = loanAmount;
        const calculatedInterest = interestRate / 100 / 12;
        const totalMonths = Math.floor(loanTenure * 100)
        const emi = (principal * calculatedInterest * Math.pow(1 + calculatedInterest, totalMonths)) / (Math.pow(1 + calculatedInterest, totalMonths) - 1);
        return emi.toFixed(2);
    };

    const totalMarketingPrice = (month) => {
        let final_price = price * Math.floor(month * 100)
        return final_price
    }

    const calculateMonthlyPrice = (month) => {
        if (programType == 'loan') {
            let emiPrice = calculateEMI(loanPrice, 8, month)
            setPerMonthPrice(emiPrice != 'Infinity' ? emiPrice : '0')
            return emiPrice
        } else {
            let marketingPrice = totalMarketingPrice(month)
            setPerMonthPrice(marketingPrice)
            setMarketingPrice(marketingPrice)
            return marketingPrice
        }
    }

    const onSliderValueChange = (month) => {
        calculateMonthlyPrice(month)
        setSliderState(month)
    }

    const recomputeBalance = () => {
        let finalPrice = (programType == 'loan') ? parseInt(loanPrice) : - parseInt(marketingPrice)
        let finalBalance = parseInt(updatedBalance) + finalPrice
        dispatch(updateBalance({ 'price': finalBalance, 'updateBalanceDB': true }))
    }


    const applyForLoan = (tx) => {
        tx.executeSql(
            `SELECT * FROM loan WHERE id = ? AND is_buy = ?;`,
            [ID, 1],
            (_, { rows }) => {
                let len = rows.length
                if (len > 0) {
                    Toast.show({
                        type: 'error',
                        text1: `This loan is already active.`,
                        autoHide: true,
                        visibilityTime: 4000,
                    });
                    setModalVisible(false)
                } else {
                    tx.executeSql(
                        `UPDATE loan SET is_buy = ?, emi_month = ?, emi_price = ? WHERE id = ?;`,
                        [1, Math.floor(sliderState * 100), parseInt(perMonthPrice), ID],
                        (tx, results) => {
                            Toast.show({
                                type: 'success',
                                text1: `Loan successfully applied!`,
                                text2: `You've been granted ₹${loanPrice.toLocaleString()}.`,
                                autoHide: true,
                                visibilityTime: 4000,
                            });

                            recomputeBalance()
                            setModalVisible(false)
                        },
                        (error) => {
                            console.log('Error getting data:', error);
                        }
                    )
                }
            }
        )
    }

    const applyForMarketing = (tx) => {
        if (updatedBalance < price) {
            Toast.show({
                type: 'error',
                text1: 'Insufficient Balance.',
                autoHide: true,
                visibilityTime: 2000,
            });
            setModalVisible(false)
        }
        else {
            tx.executeSql(
                `SELECT * from staff where is_buy = ?;`,
                [1],
                (_, { rows }) => {
                    let len = rows.length
                    if (len <= 0) {
                        Toast.show({
                            type: 'error',
                            text1: `Staff Required`,
                            visibilityTime: 4000,
                        });
                        setModalVisible(false)
                    }
                    else {
                        tx.executeSql(
                            `SELECT * FROM marketing WHERE id = ? AND is_buy = ?;`,
                            [ID, 1],
                            (_, { rows }) => {
                                let len = rows.length
                                if (len > 0) {
                                    Toast.show({
                                        type: 'error',
                                        text1: `This marketing is already active.`,
                                        autoHide: true,
                                        visibilityTime: 4000,
                                    });
                                    setModalVisible(false)
                                } else {
                                    tx.executeSql(
                                        `UPDATE marketing SET is_buy = ?, marketing_end_month = ? WHERE id = ?;`,
                                        [1, Math.floor(sliderState * 100), ID],
                                        (tx, results) => {
                                            Toast.show({
                                                type: 'success',
                                                text1: `Marketing successfully applied!`,
                                                autoHide: true,
                                                visibilityTime: 4000,
                                            });

                                            recomputeBalance()
                                            setModalVisible(false)
                                        },
                                        (error) => {
                                            console.log('Error getting data:', error);
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            )
        }
    }

    const submit = () => {
        if (perMonthPrice <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Please select the month before proceeding.',
                autoHide: true,
                visibilityTime: 2500,
            });
            return false
        }

        try {
            db.transaction(function (tx) {
                if (programType == 'loan') {
                    applyForLoan(tx)
                } else {
                    applyForMarketing(tx)
                }
            })
        }
        catch {
            console.log("submit Error")
        }

    }

    const renderItems = (item) => {
        return (
            <TouchableOpacity key={item.id} style={{ padding: 10, backgroundColor: '#49337d', marginTop: 10 }} onPress={() => openApplyModal(item)}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                    <Text style={[styles.text, styles.h4, { width: '50%' }]}>{item.name}</Text>
                    <Text style={[styles.text, styles.h4, { width: '50%', textAlign: 'right' }]}>₹{item.price.toLocaleString()}</Text>
                </View>
            </TouchableOpacity>

        )
    }

    const renderLoanAndMarketingTemp = (data) => {
        return (
            <View style={{ marginTop: 30 }} key={data.id}>
                <Text style={[styles.text, styles.h3, { textAlign: 'center' }]}>{data.name}</Text>
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
                            <Text style={[styles.text, styles.h3]}>Loan And Marketing</Text>
                        </TouchableOpacity>
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
                                    <View style={{ backgroundColor: '#2e306e', height: 360, borderTopStartRadius: 20, borderTopEndRadius: 20, position: 'relative' }}>
                                        <View style={{ margin: 10 }}>
                                            <View>
                                                <Text style={[styles.h2, { padding: 10, color: "white" }]}>{modalName}</Text>
                                                <Text style={[styles.h3, { padding: 10, paddingTop: 0, color: "white" }]}>₹{price.toLocaleString()}{programType == 'marketing' && '/month'}</Text>
                                                {programType == "marketing" && (<View>
                                                    <Text style={[styles.h3, { padding: 10, paddingTop: 0, color: "white" }]}>Required</Text>
                                                    <Text style={[styles.h4, { padding: 10, paddingTop: 0, color: "white" }]}>1. Staff</Text>
                                                </View>)}
                                                {programType == "loan" && (<Text style={[styles.h4, { padding: 10, paddingTop: 0, color: "white", fontSize: 16 }]}>{roi > 0 && `${roi}%`} Interest Rate</Text>)}
                                            </View>
                                            <View>
                                                <Text style={[styles.h4, { textAlign: 'right', padding: 15, paddingBottom: 0, paddingTop: 0, color: "white" }]}>Month {Math.floor(sliderState * 100)}</Text>
                                                <Slider
                                                    style={{ width: "100%", height: 40 }}
                                                    minimumValue={0}
                                                    maximumValue={1}
                                                    minimumTrackTintColor="#823894"
                                                    maximumTrackTintColor="white"
                                                    thumbTintColor="#823894"
                                                    value={sliderState}
                                                    onValueChange={(value) => onSliderValueChange(value)}
                                                />
                                            </View>
                                            <View>
                                                <Text style={[styles.h4, { textAlign: 'center', color: "white" }]}>{programType != 'loan' && 'Total Price: '}₹{parseInt(perMonthPrice).toLocaleString()}{programType == 'loan' && '/month'}</Text>
                                            </View>
                                            <View>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }} onPress={() => submit()}>
                                            <Text style={styles.applyButton}>Apply</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ReactNativeModal>
                                {
                                    equipmentData.length ? (
                                        equipmentData.map((data) => {
                                            return (
                                                renderLoanAndMarketingTemp(data)
                                            )
                                        })
                                    ) :
                                        (
                                            <Text style={styles.text}>No Loan And Marketing Found</Text>
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
    applyButton: {
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

export default LoanAndMarketingPage