/**
 * @file Manages main settings screen (in-between for user/preset settings)
 * @author Emily Sturman <emily@sturman.org>
 */
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet
} from "react-native";
import InputsList from "../../components/userFields/UserInputsList";
import SubmitButton from "../../components/userFields/SubmitButton";
import Header from "../../components/Header";
import { connect } from "react-redux";
import { watchUserData, editUserData } from "../../redux/Actions";
import { EmailField, PasswordField } from "../../constants/RequiredFields";
import Colors from "../../constants/Colors";

/**
 * Renders user setting screen.
 *
 * Renders inputs list (FlatList of ValidatedInputs) displaying user fields and
 * containing user data.
 *
 * @param {Object}                   user          Object containing user data.
 * @param {Object[]}                 userFields    Array containing input fields to contain data.
 * @param {function(string)}         watchUserData Listener for changes in user data.
 * @param {function(Object, string)} editUserData  Pushes edited data to Firebase.
 * @param {Object}                   navigation    Navigation prop passed by React Navigation.
 *
 * @return {React.ReactElement} Element to display.
 * @constructor
 */
const UserSettingsScreen = ({ user, userFields, watchUserData, editUserData, navigation }) => {
  const [state, setInputs] = useState(user);

  const submitData = () => editUserData(state, user.uid);
  const UpdateButton = (props) => <SubmitButton {...props} title={"Update"} style={styles.updateButton} />

  // Listens for changes in user data when on this page
  useEffect(() => watchUserData(user.uid), []);

  return (
    <View style={styles.container}>
      <Header title={"Profile Settings"} leftButton={{ name: "ios-arrow-back", onPress: () => navigation.pop() }} />
      <InputsList
        data={userFields}
        state={state}
        setInputs={setInputs}
        onSubmit={submitData}
        editing
        SubmitButton={UpdateButton}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  )
};

const mapStateToProps = ({ user, stateConstants }) => ({
  user,
  userFields: [EmailField, PasswordField, ...stateConstants.userFields]
});

const mapDispatchToProps = (dispatch) => ({
  watchUserData: (uid) => watchUserData(dispatch, uid),
  editUserData: (data, uid) => editUserData(dispatch, data, uid)
});

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsScreen);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.scrollViewBackground,
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  updateButton: {
    marginHorizontal: 20
  }
});