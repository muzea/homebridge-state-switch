import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from "homebridge";
import got from "got";
import { PLUGIN_NAME } from "./settings";

let hap: HAP;

const SwitchState = {
  off: "off",
  on: "on",
};

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory(PLUGIN_NAME, StateSwitch);
};

class StateSwitch implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private api = "";

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    log.info("config ", config);
    this.log = log;
    this.name = config.name;
    this.api = config.api as string;
    this.switchService = new hap.Service.Switch(this.name);
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .on(
        CharacteristicEventTypes.GET,
        (callback: CharacteristicGetCallback) => {
          log.info("try get remote state");
          got
            .get(this.api)
            .json()
            .then((resp: any) => {
              log.info("remote state ", resp);
              const value = resp[this.name];

              log.info(
                "Current state of the switch was returned: " +
                  (value === SwitchState.on ? "ON" : "OFF")
              );

              callback(undefined, value === SwitchState.on);
            });
        }
      )
      .on(
        CharacteristicEventTypes.SET,
        (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          log.info("try set remote state");
          const nextValue = Boolean(value);
          log.info("Switch state was set to: " + (nextValue ? "ON" : "OFF"));
          got
            .put(this.api, {
              json: {
                [this.name]: nextValue ? SwitchState.on : SwitchState.off,
              },
              responseType: "json",
            })
            .then((resp) => {
              log.info("remote state ", resp.body);
              callback();
            });
        }
      );

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
      .setCharacteristic(hap.Characteristic.Model, "Custom Model");

    log.info("Switch finished initializing!");
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService];
  }
}
