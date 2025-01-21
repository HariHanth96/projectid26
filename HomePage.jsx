import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    StatusBar, 
    ScrollView, 
    Image, 
    SafeAreaView, 
    ImageBackground 
} from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import ReactNativeModal from "react-native-modal";
import SQLite from 'react-native-sqlite-storage';
import { useDispatch, useSelector } from 'react-redux';
import { updateBalance, updateMonth } from '../src/slices/bsaSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const db = SQLite.openDatabase("bsa.db")

const HomePage = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const updatedMonth = useSelector((state) => state.user.month)
    const updatedBalance = useSelector((state) => state.user.balance)
    const [playerName, setPlayerName] = useState('User')
    const [businessName, setBusinessName] = useState('Business')
    const [balance, setBalance] = useState(0)
    const [month, setMonth] = useState(0)
    const [customerCount, setCustomerCount] = useState(0)
    const [lastCustomerCount, setLastCustomerCount] = useState(0)
    const [staffData, setStaffData] = useState([])
    const [equipmentData, setEquipmentData] = useState([])
    const [loanData, setLoanData] = useState([])
    const [marketingData, setMarketingData] = useState([])
    const [buildingData, setBuildingData] = useState([])
    const [profitPerMonth, setProfitPerMonth] = useState(0)
    const [totalBillAmount, setTotalBillAmount] = useState(0)
    const [netProfitPerMonth, setNetProfitPerMonth] = useState(0)
    const [totalProfit, setTotalProfit] = useState(0)
    const [lastCustomerRate, setLastCustomerRate] = useState(0)
    const [lastOrgCustomerVal, setLastOrgCustomerVal] = useState(0)
    const [initOrgCustomerVal, setInitOrgCustomerVal] = useState(0)
    const [customerValueChange, setCustomerValueChange] = useState(false)
    const [profitValueChange, setProfitValueChange] = useState(false)
    const [totalProfitValueChange, setTotalProfitValueChange] = useState(false)
    const [timer, setTimer] = useState(3);
    const [isRunningTimer, setIsRunningTimer] = useState(false);
    const [modalVisible, setModalVisible] = useState(false)
    const [settingModalVisible, setSettingModalVisible] = useState(false)
    const [accountModalVisible, setAccountModalVisible] = useState(false)

    useFocusEffect(
        useCallback(() => {
            getUserData()
            getStaffData()
            getBuildingData()
            getEquipmentData()
            getLoanData()
            getMarketingData()
        }, [])
    );


    useEffect(() => {
        if (customerValueChange) {
            getProfitPerMonth();
        }
    }, [customerValueChange]);

    useEffect(() => {
        if (profitValueChange) {
            getTotalProfitValue()
            updateBalanceAfterProfit()
        }
    }, [profitValueChange]);

    useEffect(() => {
        if (totalProfitValueChange) {
            updateUserData()
            setCustomerValueChange(false)
            setTotalProfitValueChange(false)
            setProfitValueChange(false)
        }
    }, [totalProfitValueChange]);


    useEffect(() => {
        let countdown;
        if (isRunningTimer && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(countdown);
            setIsRunningTimer(false)
        }
        return () => clearInterval(countdown);
    }, [isRunningTimer, timer]);

    const getEquipmentData = () => {
        try {
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
                        console.log('Error fetching Equiments Items');
                    }
                )
            })
        } catch {
            console.log("getBuildingData error")
        }
    }

    const getLoanData = () => {
        try {
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
                        console.log('Error fetching loan');
                    }
                )
            })
        } catch {
            console.log("getLoanData Error")
        }
    }

    const getMarketingData = () => {
        try {
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
                        console.log('Error fetching Marketing');
                    }
                )
            })
        } catch {
            console.log("getLoanData Error")
        }
    }

    const getUserData = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM Users WHERE active = ?;',
                    [1],
                    (tx, results) => {
                        const len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            row.name && setPlayerName(row.name)
                            row.bs_name && setBusinessName(row.bs_name)
                            row.balance && setBalance(row.balance)
                            row.month && setMonth(row.month)
                            row.profitPerMonth && setProfitPerMonth(row.profitPerMonth)
                            row.totalProfit && setTotalProfit(row.totalProfit)
                            row.customer_count && setCustomerCount(row.customer_count)
                            row.last_customer_count && setLastCustomerCount(row.last_customer_count)
                            row.last_customer_rate && setLastCustomerRate(row.last_customer_rate)
                            row.last_org_customer_val && setLastOrgCustomerVal(row.last_org_customer_val)
                            row.init_org_customer_val && setInitOrgCustomerVal(row.init_org_customer_val)
                            row.netProfitPerMonth && setNetProfitPerMonth(row.netProfitPerMonth)
                            row.totalBillAmount && setTotalBillAmount(row.totalBillAmount)
                            dispatch(updateBalance({ 'price': row.balance || 0 }))
                            dispatch(updateMonth({ 'month': row.month || 0 }))
                        }
                    },
                    (error) => {
                        console.log('Error getting data:', error);
                    }
                );
            });
        } catch {
            console.log("getUserData Error ")
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
                );
            })
        } catch {
            console.log("getBuildingData error",)
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
                );
            })
        } catch {
            console.log("getStaffData error",)
        }
    }

    const updateUserData = () => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    'UPDATE Users SET customer_count = ?, last_customer_count = ?, profitPerMonth = ?, totalProfit = ?, netProfitPerMonth = ?, totalBillAmount = ?, last_customer_rate = ?, init_org_customer_val = ? WHERE active = ?;',
                    [customerCount, lastCustomerCount, profitPerMonth, totalProfit, netProfitPerMonth, totalBillAmount, lastCustomerRate, initOrgCustomerVal, 1],
                );
            })
        } catch {
            console.log("updateUserData error",)
        }
    }

    const getCustomerCount = async () => {
        let totalBillAmount = getMonthlyBillAmount()
        setTotalBillAmount(totalBillAmount)
        if (staffData.length || equipmentData.length || marketingData.length) {
            let staffCustomerRate = staffData.reduce((acc, item) => acc + item.customer_rate, 0);
            let equipmentCustomerRate = equipmentData.reduce((acc, item) => acc + (item.customer_rate * item.qty), 0);
            let marketingCustomerRate = marketingData.reduce((acc, item) => item.marketing_end_month > 0 && acc + item.customer_rate, 0);
            const totalCustomerRate = staffCustomerRate + equipmentCustomerRate + marketingCustomerRate
            marketingData.forEach(marketing => {
                if (marketing.marketing_end_month > 0) {
                    marketing.marketing_end_month--;
                } 
                else if (marketing.is_buy > 0) {
                    marketing.is_buy = 0
                    Toast.show({
                        type: 'error',
                        text1: `Your marketing plan has expired.`,
                        text2: `${marketing.name}`,
                        autoHide: true,
                        visibilityTime: 3000,
                    });
                }
                updateMarketingData(marketing)
            });
            if (totalCustomerRate > 0) {
                let initOrgCustomerCount = initOrgCustomerVal
                let updatedtotalCustomerVal = initOrgCustomerCount ? initOrgCustomerCount * (1 + (totalCustomerRate / 100)) : totalCustomerRate
                if (totalCustomerRate != lastCustomerRate) {
                    if(lastCustomerCount < totalCustomerRate){
                        setInitOrgCustomerVal(lastOrgCustomerVal)
                        setLastOrgCustomerVal(updatedtotalCustomerVal)
                        setLastCustomerRate(totalCustomerRate)
                    }else{
                        setLastOrgCustomerVal(parseInt(updatedtotalCustomerVal / 2 ))
                        setInitOrgCustomerVal(lastOrgCustomerVal)
                    }
                }
                let minCustomerValue = Math.ceil(initOrgCustomerCount);
                let maxCustomerValue = Math.floor(updatedtotalCustomerVal);
                const customerRandomNumber = Math.floor(Math.random() * (maxCustomerValue - minCustomerValue + 1)) + minCustomerValue;
                setLastCustomerCount(customerCount)
                setCustomerCount(customerRandomNumber)
            } else {
                setCustomerCount(0)
                setLastCustomerCount(0)
            }
            setCustomerValueChange(true)
        }
        else {
            setCustomerCount(0)
            setLastCustomerCount(0)
            getProfitPerMonth()
        }
    }

    const updateLoanData = (loanData) => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE loan SET is_buy = ?, emi_current_month = ?, emi_month = ?, emi_price = ? WHERE id = ?;`,
                    [loanData.is_buy, loanData.emi_current_month, loanData.emi_month, loanData.emi_price, loanData.id]
                )
            })
        } catch {
            console.log("updateLoanData Error.")
        }
    }

    const updateMarketingData = (marketingData) => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE marketing SET is_buy = ?, marketing_end_month = ? WHERE id = ?;`,
                    [marketingData.is_buy, marketingData.marketing_end_month, marketingData.id]
                )
            })
        } catch {
            console.log("updateMarketingData Error.")
        }
    }

    const getMonthlyBillAmount = () => {
        let billAmount = 0
        if (staffData.length) {
            let totalStaffPrice = staffData.reduce((sum, item) => sum + item.price, 0);
            billAmount += totalStaffPrice
        }
        if (buildingData.length) {
            let totalBuildingPrice = buildingData.reduce((sum, item) => sum + item.price, 0);
            billAmount += totalBuildingPrice
        }
        if (loanData.length) {
            let totalEmiPrice = 0;
            loanData.forEach(loan => {
                if (loan.emi_month !== loan.emi_current_month) {
                    totalEmiPrice += loan.emi_price;
                    loan.emi_current_month++;
                } else {
                    loan.emi_current_month = 0
                    loan.emi_month = 0
                    loan.emi_price = 0.0
                    loan.is_buy = 0
                }
                updateLoanData(loan)
            });

            billAmount += totalEmiPrice
        }
        return billAmount
    }

    const getProfitPerMonth = async () => {

       /* const customerRandomNumber = Math.floor(Math.random() * (maxCustomerValue - minCustomerValue + 1)) + minCustomerValue;*/
        const random_var=Math.floor(Math.random()*(10-1+1)) ;
        let perCutomerPrice = 0;
        if(random_var<=3){
            perCutomerPrice = -(Math.floor(Math.random()*(100-0+1)) );
        }
        else{
            perCutomerPrice = (Math.floor(Math.random()*(2000-500+1)) );
        }
        
        let profitValue = (customerCount * perCutomerPrice)
        let finlTotalBillAmount = totalBillAmount || getMonthlyBillAmount()
        setProfitPerMonth(profitValue)
        setTotalBillAmount(finlTotalBillAmount)
        setNetProfitPerMonth(profitValue - totalBillAmount)
        setProfitValueChange(true)
    }

    const getTotalProfitValue = () => {
        let totalProfitValue = netProfitPerMonth + totalProfit
        setTotalProfit(totalProfitValue)
        setTotalProfitValueChange(true)
    }

    const updateBalanceAfterProfit = () => {
        let updatedBalanceValue = updatedBalance + netProfitPerMonth
        dispatch(updateBalance({ 'price': updatedBalanceValue, 'updateBalanceDB': true }))
    }

    const goToNextMonth = async () => {
        getCustomerCount()
        dispatch(updateMonth({ updateMonthDB: true }))
        setTimer(3)
        setIsRunningTimer(true)
    }

    const goToEquipmentPage = () => {
        return navigation.navigate("EquipmentPage", {})
    }
    const goToBuildingsPage = () => {
        return navigation.navigate("BuildingsPage", {})
    }
    const goToStaffsPage = () => {
        return navigation.navigate("StaffsPage", {})
    }
    const goToLoanAndMarketingPage = () => {
        return navigation.navigate("LoanAndMarketingPage", {})
    }
    const goToOwnPage = () => {
        setSettingModalVisible(false)
        return navigation.navigate("OwnPage", {})
    }

    const openResetGameModal = () => {
        setModalVisible(true)
    }

    const goToSplashPage = () => {
        return navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'SplashScreen' }],
            })
        );
    }

    const resetGame = async () => {
        try {
            const tablesToReset = ['buildings', 'staff', 'Users', 'Equipments', 'EquipmentItems', 'loan', 'marketing'];

            db.transaction(async (tx) => {
                for (const table of tablesToReset) {
                    tx.executeSql(`DELETE FROM ${table}`);
                }
            })

            console.log('Database has been reset!');
            goToSplashPage()

        } catch (error) {
            console.log('Error resetting database');
        }
    }

    const openSettingModal = () => {
        setSettingModalVisible(true)
    }

    const openAccountModal = () => {
        setAccountModalVisible(true)
    }

    const editAccount = () => {
        setBusinessName(businessName)
        setPlayerName(playerName)
        try {
            db.transaction(tx => {
                tx.executeSql(
                    'UPDATE Users SET name = ?, bs_name = ? WHERE active = ?;',
                    [playerName, businessName, 1],
                    (tx, results) => {
                        Toast.show({
                            type: 'success',
                            text1: `Account Update Successful.`,
                            autoHide: true,
                            visibilityTime: 2000,
                        });
                    },
                    (error) => {
                        console.log('Error update account data');
                    }
                );
            })
            setSettingModalVisible(false)
            setAccountModalVisible(false)
        } catch {
            console.log("editAccount error",)
        }
    }

    return (
        <ImageBackground
            source={require('../assets/backgroundImage.jpg')}
            style={styles.mainContainer}
        >
            <View style={styles.container}>
                <StatusBar backgroundColor="black" barStyle="light-content" />
                <View style={{ display: 'flex', alignItems: 'flex-end', marginTop: 20, marginLeft: 10, marginRight: 10 }}>
                    <ReactNativeModal
                        isVisible={modalVisible}
                        onBackdropPress={() => setModalVisible(false)}
                        onBackButtonPress={() => setModalVisible(false)}
                        backdropTransitionOutTiming={1}
                        backdropTransitionInTiming={1}
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                        animationInTiming={400}
                    >
                        <View style={{ backgroundColor: 'white', height: "auto", borderRadius: 20 }}>
                            <View style={{ padding: 25 }}>
                                <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>Are you sure you want to reset the game?</Text>
                                <Text style={{ textAlign: 'center', marginTop: 10 }}>This action will permanently erase your current gameplay data.
                                    You will lose all progress and cannot recover it.</Text>

                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                    <TouchableOpacity style={{ width: '50%', padding: 10, paddingBottom: 2 }} onPress={() => { setModalVisible(false) }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '50%', padding: 10, paddingBottom: 2 }} onPress={() => { resetGame() }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Reset</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ReactNativeModal>

                    <ReactNativeModal
                        isVisible={accountModalVisible}
                        onBackdropPress={() => setAccountModalVisible(false)}
                        onBackButtonPress={() => setAccountModalVisible(false)}
                        backdropTransitionOutTiming={1}
                        backdropTransitionInTiming={1}
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                        animationInTiming={400}
                    >
                        <View style={{ backgroundColor: 'white', height: "auto", borderRadius: 20 }}>
                            <View style={{ padding: 25 }}>
                                <View>
                                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}>
                                        <Text style={[styles.text, styles.h3, { textAlign: 'start', color: 'black', width: "50%" }]}>Player Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={playerName}
                                            onChangeText={setPlayerName}
                                        />
                                    </View>
                                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}>
                                        <Text style={[styles.text, styles.h3, { textAlign: 'start', color: 'black', width: "50%" }]}>Business Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={businessName}
                                            onChangeText={setBusinessName}
                                        />
                                    </View>
                                </View>

                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                                    <TouchableOpacity style={{ width: '50%', padding: 10, paddingBottom: 2 }} onPress={() => { setAccountModalVisible(false) }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '50%', padding: 10, paddingBottom: 2 }} onPress={() => { editAccount() }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ReactNativeModal>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[styles.text, styles.h2, { textAlign: 'left', width: '80%', padding: 10, color: "white", fontSize: 40 }]} numberOfLines={1}>{businessName}</Text>
                        <View style={{ width: '20%', display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
                            <ReactNativeModal
                                isVisible={settingModalVisible}
                                onBackdropPress={() => setSettingModalVisible(false)}
                                onBackButtonPress={() => setSettingModalVisible(false)}
                                backdropTransitionOutTiming={1}
                                backdropTransitionInTiming={1}
                                animationIn="slideInDown"
                                animationOut="slideOutUp"
                                animationInTiming={400}
                                style={{ justifyContent: 'flex-start', margin: 0 }}
                            >
                                <View style={{ backgroundColor: '#2e306e', height: 100, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 10, gap: 10, margin: 10 }}>
                                        <TouchableOpacity style={{ width: '33.3%', }} onPress={() => openResetGameModal()}>
                                            <Text style={[styles.text, styles.button, { textAlign: 'center' }]}>Reset</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: '33.3%', }} onPress={() => openAccountModal()}>
                                            <Text style={[styles.text, styles.button, { textAlign: 'center' }]}>Account</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: '33.3%', }} onPress={() => goToOwnPage()}>
                                            <Text style={[styles.text, styles.button, { textAlign: 'center' }]}>Own</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ReactNativeModal>
                            <TouchableOpacity onPress={() => { openSettingModal() }}>
                                <Icon name="settings" size={30} color="white" style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{ marginTop: 10, marginLeft: 10, marginRight: 10, position: 'relative', flex: 1 }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ width: "50%" }}>
                            <Text style={[styles.text, styles.h3, { textAlign: 'left', padding: 10, }]}>Hello, {playerName}</Text>
                        </View>
                        <View style={{ width: "50%" }}>
                            <Text style={[styles.text, styles.h4, { textAlign: 'right', padding: 10 }]}>₹{updatedBalance.toLocaleString()}</Text>
                        </View>
                    </View>
                    <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <View>
                                <View style={styles.dashboadRow}>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Life Time Profit</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{totalProfit.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Profit/Month</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{profitPerMonth.toLocaleString()}</Text>
                                    </View>
                                </View>
                                <View style={styles.dashboadRow}>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Monthly Bill</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{totalBillAmount.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Net Profit/Month</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{netProfitPerMonth.toLocaleString()}</Text>
                                    </View>
                                </View>
                                <View style={styles.dashboadRow}>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Month</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{updatedMonth}</Text>
                                    </View>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Customer</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{customerCount}</Text>
                                    </View>
                                </View>
                                <View style={styles.dashboadRow}>
                                    <View style={styles.dashboadCard}>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 15 }]}>Last Customer</Text>
                                        <Text style={[styles.text, styles.h4, { textAlign: 'center', fontSize: 20 }]}>{lastCustomerCount}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ paddingBottom: 10 }}>
                                <View style={{ marginTop: 20, display: "flex", justifyContent: 'center', flexDirection: 'row', gap: 50 }}>
                                    <TouchableOpacity style={{ width: "40%" }} onPress={() => goToEquipmentPage()}>
                                        <Text style={[styles.text, styles.button, { textAlign: 'center' }]}>Equipment</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: "40%" }} onPress={() => goToBuildingsPage()}>
                                        <Text style={[styles.text, styles.button, { textAlign: 'center' }]}>Building</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {
                                        !isRunningTimer ?
                                            (
                                                <TouchableOpacity onPress={() => { goToNextMonth() }}>
                                                    <Image source={require("../assets/addButton.png")} style={styles.addButton} />
                                                </TouchableOpacity>
                                            )
                                            :
                                            (
                                                <View style={{ backgroundColor: '#49337d', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 100, height: 60, width: 60, textAlign: 'center' }}>
                                                    <Text style={[styles.text]}>{timer} sec.</Text>
                                                </View>
                                            )
                                    }
                                </View>
                                <View style={{ marginTop: 20, display: "flex", justifyContent: 'center', flexDirection: 'row', gap: 50 }}>
                                    <TouchableOpacity style={{ width: "40%" }} onPress={() => goToLoanAndMarketingPage()}>
                                        <Text style={[styles.text, styles.button, { textAlign: 'center' }]} numberOfLines={1}>Loan and Marketing</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: "40%" }} onPress={() => goToStaffsPage()}>
                                        <Text style={[styles.text, styles.button, { textAlign: 'center' }]}>Staff</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
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
        padding: 15,
        borderRadius: 100,
    },

    input: {
        height: 40,
        borderWidth: 2,
        borderRadius: 20,
        width: '50%',
        textAlign: 'center',
        fontSize: 18,
        paddingLeft: 10,
        paddingRight: 10,
    },

    addButton: {
        height: 60,
        width: 60,
        resizeMode: 'cover',
    },

    dashboadCard: {
        textAlign: 'left',
        backgroundColor: '#49337d',
        width: '50%',
        padding: 20,
        borderRadius: 15
    },

    dashboadRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        gap: 10
    }
})

export default HomePage