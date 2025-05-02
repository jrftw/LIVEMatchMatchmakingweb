export const adMobConfig = {
  bannerAdUnitId: 'ca-app-pub-6815311336585204/4056526045',
  interstitialAdUnitId: 'ca-app-pub-6815311336585204/5400832657',
  rewardedAdUnitId: 'ca-app-pub-6815311336585204/5212761200',
  nativeAdUnitId: 'ca-app-pub-6815311336585204/1230711214',
  testDevices: ['TEST_DEVICE_ID'], // Add your test device ID here
  adFrequency: {
    banner: 3, // Show banner ad every 3 page views
    interstitial: 5, // Show interstitial ad every 5 page views
    rewarded: 10 // Show rewarded ad every 10 page views
  }
};

export const adPlacements = {
  home: {
    banner: true,
    interstitial: false,
    rewarded: false,
    native: true
  },
  matchmaking: {
    banner: true,
    interstitial: true,
    rewarded: true,
    native: false
  },
  tournaments: {
    banner: true,
    interstitial: true,
    rewarded: false,
    native: true
  },
  profile: {
    banner: true,
    interstitial: false,
    rewarded: false,
    native: false
  }
}; 