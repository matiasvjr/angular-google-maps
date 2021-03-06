import {Injectable, NgZone} from '@angular/core';
import {Observable, Observer} from 'rxjs';

import {AgmMarker} from './../../directives/marker';

import {GoogleMapsAPIWrapper} from './../google-maps-api-wrapper';
import {Marker} from './../google-maps-types';

import {TweenMax, Power2} from 'gsap';

declare var google: any;

@Injectable()
export class MarkerManager {
  protected _markers: Map<AgmMarker, Promise<Marker>> =
      new Map<AgmMarker, Promise<Marker>>();

  constructor(protected _mapsWrapper: GoogleMapsAPIWrapper, protected _zone: NgZone) {}

  deleteMarker(marker: AgmMarker): Promise<void> {
    const m = this._markers.get(marker);
    if (m == null) {
      // marker already deleted
      return Promise.resolve();
    }
    return m.then((m: Marker) => {
      return this._zone.run(() => {
        m.setMap(null);
        this._markers.delete(marker);
      });
    });
  }

  updateMarkerPosition(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then(
        (m: Marker) => {
          let shouldAnimate = false;

          if (Math.abs(marker.latitude - m.getPosition().lat()) > marker.minCoordAnimationThreshold ||
              Math.abs(marker.longitude - m.getPosition().lng()) > marker.minCoordAnimationThreshold) {
              shouldAnimate = true;
          }

          if (marker.animated && shouldAnimate) {
            var obj = { lat: m.getPosition().lat(), lng: m.getPosition().lng() };

            TweenMax.ticker.fps(30);

            if (m.tween) {
                m.tween.kill();
            }
            m.tween = TweenMax.to(obj, 1, {
                lat: marker.latitude,
                lng: marker.longitude,
                onUpdate: function() {
                    m.setPosition({ lat: obj.lat, lng: obj.lng });
                },
                ease: marker.animationCurve,
                force3D: false
            });

            return undefined;
          } else {
            return m.setPosition({lat: marker.latitude, lng: marker.longitude});
          }
        });
  }

  updateTitle(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setTitle(marker.title));
  }

  updateLabel(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => { m.setLabel(marker.label); });
  }

  updateDraggable(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setDraggable(marker.draggable));
  }

  updateIcon(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setIcon(marker.iconUrl));
  }

  updateOpacity(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setOpacity(marker.opacity));
  }

  updateVisible(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setVisible(marker.visible));
  }

  updateZIndex(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setZIndex(marker.zIndex));
  }

  updateClickable(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => m.setClickable(marker.clickable));
  }

  updateAnimation(marker: AgmMarker): Promise<void> {
    return this._markers.get(marker).then((m: Marker) => {
      if (typeof marker.animation === 'string') {
        m.setAnimation(google.maps.Animation[marker.animation]);
      } else {
        m.setAnimation(marker.animation);
      }
    });
  }

  addMarker(marker: AgmMarker) {
    const markerPromise = this._mapsWrapper.createMarker({
      position: {lat: marker.latitude, lng: marker.longitude},
      label: marker.label,
      draggable: marker.draggable,
      icon: marker.iconUrl,
      opacity: marker.opacity,
      visible: marker.visible,
      zIndex: marker.zIndex,
      title: marker.title,
      clickable: marker.clickable,
      animation: (typeof marker.animation === 'string') ? google.maps.Animation[marker.animation] : marker.animation
    });

    this._markers.set(marker, markerPromise);
  }

  getNativeMarker(marker: AgmMarker): Promise<Marker> {
    return this._markers.get(marker);
  }

  createEventObservable<T>(eventName: string, marker: AgmMarker): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      this._markers.get(marker).then((m: Marker) => {
        m.addListener(eventName, (e: T) => this._zone.run(() => observer.next(e)));
      });
    });
  }
}
