import React, { useState, useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { 
    View, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions, 
    ImageBackground, 
    Image 
} from 'react-native';

const screenWidth = Dimensions.get('window').width

import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase("bsa.db")

const Splash = () => {
    const [playerName, setPlayerName] = useState('')
    const [businessName, setBusinessName] = useState('')
    const navigation = useNavigation()

    useEffect(() => {
        getUserData()
    }, [])

    const getUserData = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='Users';",
                    [],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            tx.executeSql(
                                'SELECT * FROM Users',
                                [],
                                (tx, results) => {
                                    const len = results.rows.length;
                                    for (let i = 0; i < len; i++) {
                                        let row = results.rows.item(i);
                                        setPlayerName(row.name)
                                        setBusinessName(row.bs_name)
                                    }
                                },
                                (error) => {
                                    console.log('Error getting data:', error);
                                }
                            );
                        } else {
                            console.log("Users table does not exist.");
                        }
                    },
                    (error) => {
                        console.log('Error checking table existence:', error);
                    }
                );
            });
        } catch {
            console.log("getUserData Error ")
        }
    }

    const goToRegisterForm = () => {
        if (!playerName || !businessName) {
            return navigation.navigate("RegisterForm", {})
        } else {
            return navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomePage' }],
                })
            );
        }
    }

    return (
        <ImageBackground
            source={require('../assets/splash1.jpeg')}
            style={styles.mainContainer}
        >
            <View>
                <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/bsa_text1.png')} style={styles.bsaImgHeading} />
                    <Image source={require('../assets/bsa_text2.png')} style={styles.bsaImgHeading} />
                    <Image source={require('../assets/bsa_text3.png')} style={styles.bsaImgHeading} />
                </View>
                <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity style={{ height: "auto", width: 150}} onPress={() => goToRegisterForm()}>
                        <Image source={require('../assets/playGame.png')} style={styles.playGameButton} />
                    </TouchableOpacity>
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

    bsaImgHeading: {
        height: 80,
        width: screenWidth - 50,
        resizeMode: 'contain',
    },

    text: {
        color: 'white',
    },

    bsg_heading: {
        width: screenWidth,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
    },

    playGameButton: {
        height: 150,
        width: 150,
        resizeMode: 'contain',
    },

    playButton: {
        fontSize: 25,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#24a7f2',
        padding: 20,
        borderRadius: 100,
        width: screenWidth / 2
    }
})

export default Splash