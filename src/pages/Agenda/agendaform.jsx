import { useState, useEffect } from 'react'
import { Button, TextField, CircularProgress, MenuItem } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { startTransition } from 'react';
import { get, put, post } from '../../services/http';
import { FutmanagerTitles, FutmanagerSnackbar} from '../../components';
import { getUser } from '../../services/storage';
import { Tune } from '@mui/icons-material';

export default function AgendaForm() {
    var { id } = useParams();
    const usuario = getUser();
    const [item, setItem] = useState({
        dataAgenda: '',
        horaAgenda: '',
        categoria_id: '',
        Agenda_tipo_id: '',
        user_id: usuario.id,
        finalizada: 0
    });
    const [load, setLoad] = useState(id == 0 ? false : true);
    const [categoria, setCategoria] = useState([]);
    const [tipoAgenda, setTipoAgenda] = useState([]);
    const [snackOptions, setSnackOptions] = useState({ mensage: "Unknow", type: "error", open: false });
    const navegacao = useNavigate();

    const getCategoria = () => {
        get('api/categoria').then((response) => {
            setCategoria(response.data.data)
        }).catch((erro) => {
            setSnackOptions(prev => ({
                mensage: erro?.response?.data?.message ? erro.response.data.message : erro?.message ? erro.message : 'Unespected error appears',
                type: "error",
                open: true
            }));
        });
    }

    const getTipoAgenda = () => {
        get('api/agendaTipo').then((response) => {
            setTipoAgenda(response.data.data)
        }).catch((erro) => {
            setSnackOptions(prev => ({
                mensage: erro?.response?.data?.message ? erro.response.data.message : erro?.message ? erro.message : 'Unespected error appears',
                type: "error",
                open: true
            }));
        });
    }

    const getAgenda = () => {
        setLoad(true)
        get(`api/Agenda/${id}`).then((response) => {
            setItem(response.data)
            setLoad(false)
        }).catch((erro) => {
            setSnackOptions(prev => ({
                mensage: erro?.response?.data?.message ? erro.response.data.message : erro?.message ? erro.message : 'Unespected error appears',
                type: "error",
                open: true
            }));
            setLoad(false)
        });
    }

    const editar = (body) => {
        setLoad(true)
        put(`api/agenda/${id}`, body).then((response) => {
            setSnackOptions(prev => ({ 
                mensage: "Agenda atualizada com Sucesso", 
                type: "success", 
                open: true 
            }));
            setLoad(false)
            setTimeout(() => {
                navegacao('/presencas/'+response.data.id)
            }, 3000);                
        }).catch((erro) => {
            setSnackOptions(prev => ({
                mensage: erro?.response?.data?.message ? erro.response.data.message : erro?.message ? erro.message : 'Unespected error appears',
                type: "error",
                open: true
            }));
            setLoad(false)
        });
    }

    const criar = (body) => {
        setLoad(true)
        post(`api/Agenda`, body).then((response) => {
            setSnackOptions(prev => ({ mensage: "Agenda criada com Sucesso", type: "success", open: true }));
            setLoad(false)
            setTimeout(() => {
                navegacao('/presencas/'+response.data.id)
            }, 3000); 
        }).catch((erro) => {
            setSnackOptions(prev => ({
                mensage: erro?.response?.data?.message ? erro.response.data.message : erro?.message ? erro.message : 'Unespected error appears',
                type: "error",
                open: true
            }));
            setLoad(false)
        });
    }

    useEffect(() => {
        if (!item?.id && id != 0) {
            getAgenda();
        }
    }, [item]);

    useEffect(() => {
        getCategoria();    
        getTipoAgenda(); 
    }, []);

    const salvar = (event) => {
        event.preventDefault();
        var body = {
            ...item,
        }
        if (id == 0) criar(body)
        else editar(body)
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setItem({
            ...item,
            [name]: value,
        });
    };

    const voltarPagina = () => {
        startTransition(() => {
            navegacao('/Agendas')
        });
    };

    const closeSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOptions(prev => ({ ...prev, open: false }));
    };

    var titulo = id == 0 ? "Cadastrar Agenda" : "Editar Agenda"

    return (
        <>
            <FutmanagerTitles back={voltarPagina} title={titulo} />
            {!load && (
                <form className='w-full' onSubmit={salvar}>
                    <div className='w-full flex flex-row items-start ml-10 mb-1'>
                        <TextField className='w-2/5 ml-10'
                            type='date'
                            required
                            label="Data da Agenda"
                            name="dataAgenda"
                            value={item.dataAgenda}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField className='w-2/5 ml-5'
                            type='time'
                            required
                            label="Hora"
                            name="horaAgenda"
                            value={item.horaAgenda}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>

                    <div className='w-full flex flex-row items-start ml-10 mb-1'>
                        <TextField className='w-3/12 ml-10'
                            required
                            select
                            name='categoria_id'
                            value={item.categoria_id}
                            label="Categoria"
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        >
                            {categoria.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.categoria}</MenuItem>
                            ))}
                        </TextField>

                        <TextField className='w-3/12 ml-10'
                            required
                            select
                            name='Agenda_tipo_id'
                            value={item.Agenda_tipo_id}
                            label="Tipo de Agenda"
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        >
                            {tipoAgenda.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.tipoAgenda}</MenuItem>
                            ))}
                        </TextField>
                
                        <TextField className='w-3/12 ml-10'
                            required
                            select
                            name='finalizada'
                            value={item.finalizada}
                            label="Finalizada"
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        >
                            <MenuItem value={1}>SIM</MenuItem>
                            <MenuItem value={0}>Não</MenuItem>
                        </TextField>
                    </div>
    
                    <div className='flex float-right mt-6 p-5'>
                        <Button type="submit" variant="contained" className='bg-green-600 hover:bg-green-700' 
                            startIcon={<SaveIcon />}>
                            Salvar
                        </Button>
                    </div>
                </form>
            )}
            {load && (<CircularProgress />)}
            <FutmanagerSnackbar
                mensage={snackOptions.mensage}
                type={snackOptions.type}
                open={snackOptions.open}
                handleClose={closeSnackBar} />
        </>
    )
}