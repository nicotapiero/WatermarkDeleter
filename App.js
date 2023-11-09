import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, TextInput, StyleSheet, Text} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';


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

  const [albumName, onChangeAlbumName] = React.useState('Memes');

  const [isSelected, setSelection] = useState(true);



  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

console.log('hiii', permissionResponse)

  const pickImage = async () => {

    requestPermission()

    if (permissionResponse.accessPrivileges !== 'all') {
      console.log('give me access')

      return 
    }

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.All,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      selectionLimit: 0,
      allowsMultipleSelection: true,
    });

    console.log(result);


    if (!result.canceled) {

      for (const asset of result.assets) {

        console.log(asset);
        console.log('hi')


        let manipResult = await manipulateAsync(
      asset.uri,
      [{crop: {
  height: asset.height-20, 
  originX: 0, 
  originY: 0, 
  width: asset.width
}}],
      { compress: 1, format: SaveFormat.PNG }
    );
      console.log('result', manipResult)

      const editedAsset = await MediaLibrary.createAssetAsync(manipResult.uri);

      let res = await MediaLibrary.isAvailableAsync()

      console.log('rest ', res)


      let prom = await MediaLibrary.getAlbumsAsync();
      console.log('hey', prom)

      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (album === null) {
        album = await MediaLibrary.createAlbumAsync(albumName);
      }
      
      console.log('whaat', album)

      // add option to saving to album, allow user to set album name
      let res2 = await MediaLibrary.addAssetsToAlbumAsync(editedAsset, album)    
      }

      // delete photos, also make an option
      let ids = result.assets.map((asset) => asset.assetId);
      await MediaLibrary.deleteAssetsAsync(ids)
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text >
        {'Album Name to Save To:'}
      </Text>


      <TextInput
      style={styles.input}
        value={albumName}
        onChangeText={onChangeAlbumName}
      />

      <Button title="Pick images from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}

