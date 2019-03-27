import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import AssetCard2 from './AssetCard2';
import OperationsMap from './OperationsMap';

export default class TransactionDetails extends React.Component {
    static generateTableRow(label, content) {
        return (
            <div key={`${label}_key`} className="Details_row">
                <div className="Details_row_label">{label}</div>
                <div className="Details_row_content">{content}</div>
            </div>
        );
    }

    static getOperationAttr(op) {
        const attributes = [];

        Object.keys(op).forEach((attr) => {
            const value = op[attr];

            if (attr === 'type') {
                // no-op
            } else if (attr === 'limit') {
                // No need to show limit
            } else if (value !== undefined) {
                let displayValue;
                let hide = false;
                if (value.code !== undefined) {
                    displayValue = <AssetCard2 code={value.code} issuer={value.issuer} inRow />;
                } else if (value === '922337203685.4775807') {
                    // 2^63-1, the max number in Stellar, 64-bit fixed int
                    displayValue = 'maximum'; // Hmm, is this even used anywhere?
                } else if (typeof value === 'string') {
                    displayValue = value;
                } else {
                    displayValue = <pre>{JSON.stringify(value, null, 2)}</pre>;
                }

                let name;
                if (attr === 'line' || attr === 'asset') {
                    // Don't show title for assets
                } else {
                    name = attr;
                }

                if (op.type === 'manageOffer' && op.amount === '0') {
                    if (attr === 'selling' || attr === 'buying' || attr === 'amount' || attr === 'price') {
                        hide = true;
                    }
                }

                if (!hide) {
                    if (attr === 'asset') {
                        // Push asset to the top
                        attributes.unshift({
                            key: attr,
                            name,
                            display: displayValue,
                        });
                    } else {
                        attributes.push({
                            key: attr,
                            name,
                            display: displayValue,
                        });
                    }
                }
            }
        });

        return attributes;
    }

    static getOperationLabel(op) {
        switch (op.type) {
        case 'changeTrust':
            return op.limit === '0' ? 'Remove Asset' : 'Accept Asset';
        case 'manageOffer':
            return op.amount === '0' ? 'Delete Offer' : null;
        default:
            break;
        }
        return OperationsMap[op.type].label;
    }

    getOperations() {
        const { tx } = this.props;
        const operations = [];

        tx.operations.forEach((op) => {
            const attributes = this.constructor.getOperationAttr(op);
            const label = this.constructor.getOperationLabel(op);

            operations.push(
                this.constructor.generateTableRow(
                    label,
                    attributes.map(attribute => (
                        <article key={attribute.key}>
                            {attribute.name ? <span className="Inline_title">{attribute.name}</span> : null}
                            <div className="Inline_content">{attribute.display}</div>
                        </article>
                    )),
                ),
            );
        });

        return operations;
    }

    getMemo() {
        const { tx } = this.props;

        return tx.memo._type === 'none' ? (
            <span className="Content_light">No memo</span>
        ) : (
            <React.Fragment>
                <p className="Inline_title">{tx.memo._type}</p>
                <div className="Inline_content">{tx.memo._value}</div>
            </React.Fragment>
        );
    }

    render() {
        const { tx } = this.props;

        const networkFeeString = `${new BigNumber(tx.fee).dividedBy(10000000).toString()} XLM ${
            tx.fee <= 100 ? '(≈$0.00)' : ''
        }`;

        return (
            <div className="TransactionDetails">
                {this.constructor.generateTableRow('Source', tx.source)}
                {this.constructor.generateTableRow('Sequence', tx.sequence)}
                {this.getOperations()}
                {this.constructor.generateTableRow('Network Fee', networkFeeString)}
                {this.constructor.generateTableRow('Memo', this.getMemo())}
            </div>
        );
    }
}

TransactionDetails.propTypes = {
    // TODO: Valid proptype
    tx: PropTypes.string.isRequired,
};
