// logMessageResolver.js
const {
  loginModuleAction,
  backupModuleAction,
  formationModuleAction,
  ltsModuleAction,
  userModuleAction,
  driverModuleAction,
  mobileControlCenterModuleAction,
  mobileGateCheckoutModuleAction,
  manageAmkQuantity,
  manageAmkQuantityImportDataAction,
} = require("../modules/actionData");
const db = require("../models");

const getLogMessage = async (module_name, http_method, status, req, res) => {
  if (module_name === "Login") {
    const logActions = loginModuleAction((username = req.body.username));

    const matchingAction = logActions.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }
  if (module_name === "Backup") {
    // takeout the username
    const username = await findUserData(req.headers.user_id);
    const backupAction = backupModuleAction(username);
    const matchingAction = backupAction.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }

  if (module_name === "Manage Formations") {
    // takeout the username
    const username = await findUserData(req.headers.user_id);
    let formationData = null;
    if (http_method === "PUT" || http_method === "DELETE") {
      formationData = await findFormationData(req.params.formation_id);
    }
    const formationAction = formationModuleAction(username, formationData);

    const matchingAction = formationAction.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }

  if (module_name === "Manage LTS") {
    // takeout the username
    const username = await findUserData(req.headers.user_id);
    let ltsData = null;
    if (http_method === "PUT" || http_method === "DELETE") {
      ltsData = await findLtsData(req.params.lts_Id);
    }
    const ltsAction = ltsModuleAction(username, ltsData);

    const matchingAction = ltsAction.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }

  if (module_name === "Manage Users" && (http_method === "PUT" || http_method === "DELETE" || http_method === "POST" ) ) {
    // takeout the username
    const username = await findUserData(req.headers.user_id);
    let userData = null;
    if (http_method === "PUT" || http_method === "DELETE") {
      userData = await findUserData(req.params.user_id);
    }
    const userAction = userModuleAction(username, userData);

    const matchingAction = userAction.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }
  if (module_name === "Manage Vehicles") {
    // takeout the username
    const username = await findUserData(req.headers.user_id);

    const driverAction = driverModuleAction(username);
    const url = req.originalUrl;
    const matchingAction = driverAction.find(
      (action) =>
        action.http_method === http_method &&
        action.status === status &&
        url.startsWith(action.api_url)
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }

  if (module_name === "Mobile Control Center") {
    // takeout the username
    const username = await findUserData(req.headers.user_id);

    const driverAction = mobileControlCenterModuleAction(username);
    const url = req.originalUrl;
    const matchingAction = driverAction.find(
      (action) =>
        action.http_method === http_method &&
        action.status === status &&
        url.startsWith(action.api_url)
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }
  if (module_name === "Mobile Gate Checkout") {
    // takeout the username
    const username = await findUserData(req.headers.user_id);

    const driverAction = mobileGateCheckoutModuleAction(username);
    const url = req.originalUrl;
    const matchingAction = driverAction.find(
      (action) =>
        action.http_method === http_method &&
        action.status === status &&
        url.startsWith(action.api_url)
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }
  if (module_name === "Manage AMK Quantity") {
    const username = await findUserData(req.headers.user_id);
    let manageAmkQuantityData = null;
    if (
      http_method === "PUT" ||
      http_method === "DELETE" ||
      http_method === "PATCH"
    ) {
      manageAmkQuantityData = await findManageAMKQuantityData(
        req.params.amk_id
      );
    }
    const manageAmkQuantityAction = manageAmkQuantity(
      username,
      manageAmkQuantityData
    );
   
    const matchingAction = manageAmkQuantityAction.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }
  if (module_name === "Manage AMK Quantity(import file)") {
    const username = await findUserData(req.headers.user_id);

    const manageAmkQuantityAction = manageAmkQuantityImportDataAction(username);
    const matchingAction = manageAmkQuantityAction.find(
      (action) => action.http_method === http_method && action.status === status
    );
    return matchingAction
      ? {
          action_performed: matchingAction.action_performed,
          message: matchingAction.message,
        }
      : null;
  }
};

const findUserData = async (user_id) => {
  const existingUser = await db.User.findOne({
    where: {
      id: user_id,
    },
  });
  if (existingUser) {
    const { first_name, last_name } = existingUser;

    // Check if both first_name and last_name are present before concatenating
    const userFullName =
      (first_name ? first_name : "") + (last_name ? " " + last_name : "");
    return userFullName;
  } else {
    // Handle the case where the user is not found
    return null;
  }
};

const findFormationData = async (formation_id) => {
  const existingFormation = await db.formations.findOne({
    where: {
      id: formation_id,
    },
  });
  if (existingFormation) {
    return existingFormation.formation_name;
  } else {
    // Handle the case where the user is not found
    return null;
  }
};

const findLtsData = async (lts_id) => {
  const existingLtsDetails = await db.LtsDetail.findOne({
    where: {
      id: lts_id,
    },
  });
  if (existingLtsDetails) {
    return existingLtsDetails.name;
  } else {
    // Handle the case where the user is not found
    return null;
  }
};

const findManageAMKQuantityData = async (amk_id) => {
  const existingManageAmkQuantityDetails = await db.ManageAmkQuantity.findOne({
    where: {
      id: amk_id,
    },
  });
  if (existingManageAmkQuantityDetails) {
    return existingManageAmkQuantityDetails;
  } else {
    // Handle the case where the user is not found
    return null;
  }
};

module.exports = {
  getLogMessage,
  findUserData,
  findFormationData,
  findLtsData,
};
