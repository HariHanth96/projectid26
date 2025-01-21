import React, { useState, useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions, 
    ScrollView, 
    SafeAreaView, 
    ImageBackground, 
    Image 
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { useDispatch } from 'react-redux';
import { updateBalance } from '../src/slices/bsaSlice';
import loadBuildingData from '../data/BuildingData';
import loadEquipmentData from '../data/EquipmentData';
import loadStaffData from '../data/StaffData';
import loadLoanData from '../data/LoanData';
import loadMarketingData from '../data/MarketingData';
import Toast from 'react-native-toast-message';

const db = SQLite.openDatabase("bsa.db")

const screenWidth = Dimensions.get('window').width

const RegisterForm = () => {
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const [playerName, setPlayerName] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [initialBalance, setInitialBalance] = useState(0)

    useEffect(() => {
        createTable()
    }, [])

    const loadGameData = () => {
        loadBuildingData()
        loadEquipmentData()
        loadStaffData()
        loadLoanData()
        loadMarketingData()
    }

    const saveAndGoToHomePage = () => {
        let isInitialAmountNumber = /^-?\d+$/.test(initialBalance)
        if (initialBalance <= 0 || !businessName.length || !playerName.length) {
            Toast.show({
                type: 'error',
                text1: 'Required',
                text2: 'Player Name, Business Name and Initial Balance.',
                autoHide: true,
                visibilityTime: 4000,
            });
        }
        else if (!isInitialAmountNumber){
            Toast.show({
                type: 'error',
                text1: "Initial amount must be a number.",
                autoHide: true,
                visibilityTime: 4000,
            });
        }
        else if(initialBalance < 10000 || 100000 < initialBalance){
            Toast.show({
                type: 'error',
                text1: 'Limitation',
                text2: 'The initial balance should be between ₹10,000 and ₹1,00,000.',
                autoHide: true,
                visibilityTime: 4000,
            });
        }
        else {
            deleteAll()
            insertValues()
            return navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomePage' }],
                })
            );
        }
    }

    const createTable = () => {
        try {
            db.transaction(function (tx) {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS Users (
                    ID INTEGER PRIMARY KEY AUTOINCREMENT, 
                    name TEXT,
                    bs_name TEXT, 
                    balance FLOAT, 
                    month INTEGER, customer_count INTEGER, 
                    last_customer_count INTEGER, 
                    last_customer_rate INTEGER NOT NULL DEFAULT 0 , 
                    last_org_customer_val INTEGER NOT NULL DEFAULT 0 , 
                    init_org_customer_val INTEGER NOT NULL DEFAULT 0 , 
                    totalProfit INTEGER NOT NULL DEFAULT 0, 
                    profitPerMonth INTEGER NOT NULL DEFAULT 0,
                    netProfitPerMonth INTEGER NOT NULL DEFAULT 0, 
                    totalBillAmount INTEGER NOT NULL DEFAULT 0, 
                    active INTEGER NOT NULL DEFAULT 0
                    );`,
                    [],
                    (tx, results) => {
                        console.log('Table created successfully! ', results);
                    },
                    (error) => {
                        console.log('Error creating table:', error);
                    }
                );
            });
        } catch {
            console.log("createTable Error ")
        }

    }

    const deleteAll = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    'DELETE FROM Users',
                    [],
                    (tx, results) => {
                        console.log('All data deleted from users table');
                    },
                    (error) => {
                        console.log('Error All data not deleted from users table:', error);
                    }
                );
            });
        } catch {
            console.log("deleteAll Error ")
        }
    }

    const insertValues = () => {
        if (!db) {
            console.log("Database not initialized");
            return;
        } else {
            console.log("Database initialized")
        }
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    'INSERT INTO Users (name, bs_name, balance, month, customer_count, last_customer_count, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [playerName, businessName, initialBalance, 0, 0, 0, 1],
                    (tx, results) => {
                        dispatch(updateBalance({ 'price': initialBalance }))
                        loadGameData()
                    },
                    (error) => {
                        console.log('Error inserting data:', error);
                    }
                );
            });
        } catch {
            console.log("insertValues Error ")
        }
    }

    return (
        <ImageBackground
            source={require('../assets/backgroundImage.jpg')}
            style={styles.mainContainer}
        >
            <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.form}>
                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={require('../assets/register.png')} style={styles.registerImg} />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30, width: '100%' }}>
                                <Image source={require('../assets/playername.png')} style={styles.playerName} />
                                <TextInput
                                    style={styles.input}
                                    value={playerName}
                                    onChangeText={setPlayerName}
                                />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30, width: '100%' }}>
                                <Image source={require('../assets/businessname.png')} style={styles.businessName} />
                                <TextInput
                                    style={styles.input}
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30, width: '100%' }}>
                                <Image source={require('../assets/initialBalance.png')} style={styles.businessName} />
                                <TextInput
                                    style={styles.input}
                                    value={initialBalance}
                                    onChangeText={setInitialBalance}
                                />
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 50, marginTop: 50, width: '100%' }}>
                                <TouchableOpacity onPress={() => saveAndGoToHomePage()}>
                                    <Text style={[styles.text, styles.button, { backgroundColor: '#3ea364', fontSize: 20 }]}>Load Game</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
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

    form: {
        flex: 1,
        marginTop: '40%',
        marginLeft: 10,
        marginRight: 10,
    },

    registerImg: {
        height: 80,
        width: screenWidth - 50,
        resizeMode: 'contain',
    },

    input: {
        height: 40,
        borderColor: 'white',
        borderWidth: 2,
        borderRadius: 20,
        width: '55%',
        textAlign: 'center',
        color: 'white',
        fontSize: 20
    },

    h1: {
        fontSize: 40,
        fontWeight: 'bold',
    },

    h3: {
        fontSize: 20,
    },

    text: {
        color: 'white',
    },

    button: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#24a7f2',
        padding: 15,
        borderRadius: 100,
        width: 150
    },
    playerName: {
        resizeMode: 'contain',
        width: "40%",
        height: 80,
    },
    businessName: {
        resizeMode: 'contain',
        width: "40%",
        height: 80,
    }
})

export default RegisterForm