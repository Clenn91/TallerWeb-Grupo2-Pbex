import sequelize from '../config/database.js';
import User from './User.js';
import Product from './Product.js';
import ProductionRecord from './ProductionRecord.js';
import QualityControl from './QualityControl.js';
import Defect from './Defect.js';
import Certificate from './Certificate.js';
import Alert from './Alert.js';
import NonConformity from './NonConformity.js';

// Definir relaciones

// User relaciones
User.hasMany(ProductionRecord, { foreignKey: 'userId', as: 'productionRecords' });
User.hasMany(QualityControl, { foreignKey: 'userId', as: 'qualityControls' });
User.hasMany(Certificate, { foreignKey: 'requestedBy', as: 'requestedCertificates' });
User.hasMany(Certificate, { foreignKey: 'approvedBy', as: 'approvedCertificates' });
User.hasMany(Alert, { foreignKey: 'resolvedBy', as: 'resolvedAlerts' });
User.hasMany(NonConformity, { foreignKey: 'reportedBy', as: 'reportedNonConformities' });
User.hasMany(NonConformity, { foreignKey: 'resolvedBy', as: 'resolvedNonConformities' });

// Product relaciones
Product.hasMany(ProductionRecord, { foreignKey: 'productId', as: 'productionRecords' });
Product.hasMany(Certificate, { foreignKey: 'productId', as: 'certificates' });
Product.hasMany(Alert, { foreignKey: 'productId', as: 'alerts' });
Product.hasMany(NonConformity, { foreignKey: 'productId', as: 'nonConformities' });

// ProductionRecord relaciones
ProductionRecord.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
ProductionRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProductionRecord.hasMany(QualityControl, { foreignKey: 'productionRecordId', as: 'qualityControls' });
ProductionRecord.hasMany(Certificate, { foreignKey: 'productionRecordId', as: 'certificates' });
ProductionRecord.hasMany(Alert, { foreignKey: 'productionRecordId', as: 'alerts' });
ProductionRecord.hasMany(NonConformity, { foreignKey: 'productionRecordId', as: 'nonConformities' });

// QualityControl relaciones
QualityControl.belongsTo(ProductionRecord, { foreignKey: 'productionRecordId', as: 'productionRecord' });
QualityControl.belongsTo(User, { foreignKey: 'userId', as: 'user' });
QualityControl.hasMany(Defect, { foreignKey: 'qualityControlId', as: 'defects' });
QualityControl.hasOne(Certificate, { foreignKey: 'qualityControlId', as: 'certificate' });
QualityControl.hasMany(Alert, { foreignKey: 'qualityControlId', as: 'alerts' });

// Defect relaciones
Defect.belongsTo(QualityControl, { foreignKey: 'qualityControlId', as: 'qualityControl' });

// Certificate relaciones
Certificate.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Certificate.belongsTo(ProductionRecord, { foreignKey: 'productionRecordId', as: 'productionRecord' });
Certificate.belongsTo(QualityControl, { foreignKey: 'qualityControlId', as: 'qualityControl' });
Certificate.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });
Certificate.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Alert relaciones
Alert.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Alert.belongsTo(ProductionRecord, { foreignKey: 'productionRecordId', as: 'productionRecord' });
Alert.belongsTo(QualityControl, { foreignKey: 'qualityControlId', as: 'qualityControl' });
Alert.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

// NonConformity relaciones
NonConformity.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
NonConformity.belongsTo(ProductionRecord, { foreignKey: 'productionRecordId', as: 'productionRecord' });
NonConformity.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
NonConformity.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

export {
  sequelize,
  User,
  Product,
  ProductionRecord,
  QualityControl,
  Defect,
  Certificate,
  Alert,
  NonConformity,
};

