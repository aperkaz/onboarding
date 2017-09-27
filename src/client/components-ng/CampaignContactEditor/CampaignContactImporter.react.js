import React from 'react';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import { ContextComponent, ModalDialog } from '../common';
import { Campaigns } from '../../api';
import extend from 'extend';
import translations from './i18n';
import xlsx from 'xlsx';
import Papa from 'papaparse';
import discoverField, { synonyms } from './ContactFieldDiscovery';
import './CampaignContactImporter.css';

class CampaignContactImporter extends ContextComponent
{
    static propTypes = {
        campaignId : PropTypes.string.isRequired,
        customerId : PropTypes.string.isRequired,
        onResult : PropTypes.func.isRequired
    }

    static defaultProps = {
        onResult : (err, res) => null
    }

    static supportedFileExt = {
        excel : ['xls', 'xlsx'],
        csv : ['csv']
    }

    constructor(props)
    {
        super(props);

        const basicState = {
            importResult : null
        };

        this.state = extend(false, { }, basicState, props);
        this.campaignsApi = new Campaigns();
        this.resultModal = null;
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignContactImporter', translations);
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        const propsChanged = Object.keys(nextPops).reduce((all, key) => all || nextPops[key] !== this.props[key], false);

        nextContext.i18n.register('CampaignContactImporter', translations);

        if(propsChanged)
            this.setState(extend(false, { }, this.state, nextPops));
    }

    getParserCallback(file, onResult)
    {
        const { campaignId } = this.state;
        const supportedExt = CampaignContactImporter.supportedFileExt;
        const fileExt = file.substr(file.lastIndexOf('.') + 1).toLowerCase();

        if(supportedExt.excel.indexOf(fileExt) > -1)
        {
            return (e) =>
            {
                try
                {
                    const workbook = xlsx.read(e.target.result, { type: 'binary' });
                    onResult(undefined, xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
                }
                catch(e)
                {
                    onResult(e);
                }
            }
        }
        else if(supportedExt.csv.indexOf(fileExt) > -1)
        {
            return (e) =>
            {
                Papa.parse(e.target.result, {
                    header : true,
                    skipEmptyLines : true,
                    complete : (result) => onResult(undefined, result.data),
                    error : (error) => onResult(error),
                });
            }
        }
        else
        {
            onResult(new Error('CampaignContactImporter.error.fileTypeNotSupported'));

            return () => null;
        }
    }

    handleDrop(accepted, rejected)
    {
        this.setState({
            importResult : null,
            resultModalTitle : 'CampaignContactImporter.status.importing'
        });

        this.resultModal.show();

        const file = accepted.pop();

        const reader = new FileReader();
        reader.onload = this.getParserCallback(file.name, (err, result) => this.uploadResults(err, result));
        reader.onerror = (e) => this.uploadResults(e);
        reader.readAsBinaryString(file);
    }

    uploadResults(err, result)
    {
        const { showNotification, i18n } = this.context;

        if(err)
        {
            const errorMessage = i18n.getMessage(err.message);
            showNotification(errorMessage, 'error', '10');

            this.setState({
                importResult : { errors : [ errorMessage ] },
                resultModalTitle : 'CampaignContactImporter.status.result'
            });

            this.state.onResult(err);
        }
        else
        {
            const successMessage = i18n.getMessage('CampaignContactImporter.upload.success');

            this.campaignsApi.importItems(this.state.campaignId, result).then(importResult =>
            {
                this.setState({
                    importResult,
                    resultModalTitle : 'CampaignContactImporter.status.result'
                });

                return this.state.onResult(undefined, importResult);
            })
            .then(() => showNotification(successMessage, 'success'))
            .catch(e =>
            {
                showNotification(e.message, 'error', '10');
                return this.state.onResult(e);
            });
        }
    }

    render()
    {
        const { i18n } = this.context;
        const { importResult, resultModalTitle } = this.state;

        return(
            <div>
                <h3>{i18n.getMessage('CampaignContactImporter.import.instruction.header')}</h3>
                <p>{i18n.getMessage('CampaignContactImporter.import.instruction.text')}</p>
                <ul>
                    {
                        Object.keys(synonyms).map(key =>
                        {
                            return(
                                <li key={key}>
                                    <strong>{i18n.getMessage(`CampaignContactImporter.label.${key}`)}</strong> : {synonyms[key].join(', ')}
                                </li>
                            );
                        })
                    }
                </ul>
                <Dropzone className="dropzoneContainer" multiple={false} onDrop={(...args) => this.handleDrop(...args)}>
                    <div className="dropzoneMessage">
                        {i18n.getMessage('CampaignContactImporter.label.dropzone')}
                    </div>
                </Dropzone>
                <ModalDialog
                    ref={node => this.resultModal = node}
                    buttons={{ 'close' : 'Close' }}
                    title={i18n.getMessage(resultModalTitle)}>
                    {
                        (importResult &&
                            <div>
                                <table className="table importResultTable">
                                    <thead>
                                        <tr>
                                            <th>{i18n.getMessage('CampaignContactImporter.importResult.header.created')}</th>
                                            <th>{i18n.getMessage('CampaignContactImporter.importResult.header.updated')}</th>
                                            <th>{i18n.getMessage('CampaignContactImporter.importResult.header.failed')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{importResult.created}</td>
                                            <td>{importResult.updated}</td>
                                            <td>{importResult.failed}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {
                                    importResult.errors &&
                                    <div className="alert alert-danger">
                                        <ul>
                                            {
                                                importResult.errors && importResult.errors.map((value, index) =>
                                                {
                                                    return(<li key={index}>{value}</li>);
                                                })
                                            }
                                        </ul>
                                    </div>
                                }
                            </div>)
                        ||
                        <div className="text-center">
                            <i className="fa fa-cog fa-spin fa-3x fa-fw" />
                        </div>
                    }
                </ModalDialog>
            </div>
        );
    }
}

export default CampaignContactImporter;
