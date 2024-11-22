import React, { useState, useEffect } from "react";
import {
  Button,
  Image,
  View,
  Platform,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default function App() {
  const [image, setImage] = useState(null);
  //don't use the progress variable, it's kind of a piece of crap. Use it for reading in React rendering code, not in normal use
  const [progress, setProgress] = useState(0);
  const [albumName, onChangeAlbumName] = React.useState("Memes");
  const [isSelected, setSelection] = useState(true);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const pickImage = async () => {
    requestPermission();

    if (permissionResponse.accessPrivileges !== "all") {
      console.log("give me access");
      return;
    }

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.All,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      selectionLimit: 0,
      allowsMultipleSelection: true,
      orderedSelection: true,
    });

    if (!result.canceled) {
      var delta = (1 / result.assets.length) * 100;
      setProgress(0);
      var currentProgress = 0;
      for (const asset of result.assets) {
        let manipResult = await manipulateAsync(
          asset.uri,
          [
            {
              crop: {
                height: asset.height - 20,
                originX: 0,
                originY: 0,
                width: asset.width,
              },
            },
          ],
          { compress: 1, format: SaveFormat.PNG }
        );
        const editedAsset = await MediaLibrary.createAssetAsync(
          manipResult.uri
        );

        // let res = await MediaLibrary.isAvailableAsync();
        let prom = await MediaLibrary.getAlbumsAsync();

        let album = await MediaLibrary.getAlbumAsync(albumName);
        if (album === null) {
          // create the album if it doesn't already exist
          album = await MediaLibrary.createAlbumAsync(albumName);
        }

        // add option to saving to album, allow user to set album name
        await MediaLibrary.addAssetsToAlbumAsync(editedAsset, album);

        //update status bar
        currentProgress += delta;
        setProgress(currentProgress);
      }

      setProgress(Math.round(currentProgress)); // lie to them


      // delete photos, also make an option
      let ids = result.assets.map((asset) => asset.assetId);
      await MediaLibrary.deleteAssetsAsync(ids);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
      <Text>{"Album Name to Save To:"}</Text>

      <TextInput
        style={styles.input}
        value={albumName}
        onChangeText={onChangeAlbumName}
      />

      <Button title="Pick images from camera roll" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}

      <Text>{progress} % complete</Text>
    </View>
  );
}
