import React from 'react';
import type { ImageProps } from 'react-native';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholder?: React.ReactNode;
}

/**
 * Optimized image component with caching support for OpenFoodFacts and other external images
 * Features:
 * - Automatic caching
 * - Loading state
 * - Error handling
 * - Optimized headers for external APIs
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  placeholder,
  style,
  ...props
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {uri && !error ? (
        <>
          <Image
            {...props}
            source={{
              uri,
              cache: 'force-cache', // Enable aggressive caching
              headers: {
                // Optimize for OpenFoodFacts and other CDNs
                Accept: 'image/webp,image/apng,image/*,*/*',
                'Accept-Encoding': 'gzip, deflate, br',
              },
            }}
            style={style}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
          />
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          )}
        </>
      ) : (
        placeholder || (
          <View style={styles.placeholderContainer}>
            {/* Default placeholder */}
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
